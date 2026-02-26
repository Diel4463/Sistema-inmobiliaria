import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../auth/auth.middleware';

const prisma = new PrismaClient();

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [total, active, sold, pending, inactive] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.property.count({ where: { status: 'SOLD' } }),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.property.count({ where: { status: 'INACTIVE' } }),
    ]);

    const totalFiles = await prisma.file.count();
    const totalExpedientes = await prisma.expediente.count();
    const totalUsers = await prisma.user.count({ where: { isActive: true } });

    res.json({
      properties: { total, active, sold, pending, inactive },
      totalFiles,
      totalExpedientes,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function exportPropertiesCSV(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, estado, municipio } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (estado) where.estado = { contains: estado as string, mode: 'insensitive' };
    if (municipio) where.municipio = { contains: municipio as string, mode: 'insensitive' };

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Código', 'Estado', 'Propietario', 'Dirección', 'Municipio', 'Estado/Prov',
      'CP', 'Uso Actual', 'Sup. Terreno', 'Sup. Construcción', 'Tipo Crédito',
      'No. Expediente', 'Importe Adjudicación', 'Importe Adeudo', 'Fecha Adjudicación',
    ].join(',');

    const rows = properties.map((p) => [
      p.internalCode,
      p.status,
      `"${p.propietarioNombre || ''}"`,
      `"${p.ubicacionMigrada || ''}"`,
      `"${p.municipio || ''}"`,
      `"${p.estado || ''}"`,
      p.cp || '',
      `"${p.usoActual || ''}"`,
      p.superficieTerreno || '',
      p.superficieConstruccion || '',
      `"${p.tipoCredito || ''}"`,
      p.numeroExpediente || '',
      p.importeAdjudicacion?.toString() || '',
      p.importeAdeudo?.toString() || '',
      p.fechaAdjudicacion ? new Date(p.fechaAdjudicacion).toISOString().split('T')[0] : '',
    ].join(','));

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inmuebles-${Date.now()}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function exportPropertiesPDF(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Simple HTML-based PDF response (client will handle printing)
    const rows = properties.map((p) => `
      <tr>
        <td>${p.internalCode}</td>
        <td>${p.status}</td>
        <td>${p.propietarioNombre || '-'}</td>
        <td>${p.ubicacionMigrada || '-'}</td>
        <td>${p.municipio || '-'}</td>
        <td>${p.tipoCredito || '-'}</td>
        <td>${p.importeAdjudicacion ? `$${Number(p.importeAdjudicacion).toLocaleString()}` : '-'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Inmuebles</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
            h1 { color: #1a1a2e; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #1a1a2e; color: white; padding: 6px; text-align: left; }
            td { padding: 5px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f5f5f5; }
            .meta { color: #666; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Inmuebles</h1>
          <div class="meta">Generado: ${new Date().toLocaleString('es-MX')} | Total: ${properties.length} registros</div>
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Estado</th><th>Propietario</th><th>Dirección</th>
                <th>Municipio</th><th>Tipo Crédito</th><th>Importe Adjudicación</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
