import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../auth/auth.middleware';
import { createActivityLog } from '../activities/activities.controller';

const prisma = new PrismaClient();

export async function getProperties(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20', status, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { internalCode: { contains: search as string, mode: 'insensitive' } },
        { ubicacionMigrada: { contains: search as string, mode: 'insensitive' } },
        { propietarioNombre: { contains: search as string, mode: 'insensitive' } },
        { municipio: { contains: search as string, mode: 'insensitive' } },
        { estado: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { fullName: true, username: true } },
          _count: { select: { files: true, expedientes: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      data: properties,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getProperty(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        createdBy: { select: { fullName: true, username: true } },
        files: {
          include: { uploadedBy: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        expedientes: {
          include: {
            files: { include: { uploadedBy: { select: { fullName: true } } } },
          },
          orderBy: { numero: 'asc' },
        },
      },
    });

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createProperty(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = req.body;
    const { changeDescription } = req.body; // Nueva descripción del cambio

    const existing = await prisma.property.findUnique({
      where: { internalCode: data.internalCode },
    });

    if (existing) {
      res.status(409).json({ message: 'A property with this internal code already exists' });
      return;
    }

    const property = await prisma.property.create({
      data: {
        ...data,
        changeDescription: undefined, // No guardar esto en la propiedad
        importeAdjudicacion: data.importeAdjudicacion ? parseFloat(data.importeAdjudicacion) : null,
        importeAdeudo: data.importeAdeudo ? parseFloat(data.importeAdeudo) : null,
        importeAperturaCredito: data.importeAperturaCredito ? parseFloat(data.importeAperturaCredito) : null,
        importeAvaluo: data.importeAvaluo ? parseFloat(data.importeAvaluo) : null,
        importeUltimoAvaluo: data.importeUltimoAvaluo ? parseFloat(data.importeUltimoAvaluo) : null,
        valorLibros: data.valorLibros ? parseFloat(data.valorLibros) : null,
        fechaRegistro: data.fechaRegistro ? new Date(data.fechaRegistro) : null,
        fechaAperturaCredito: data.fechaAperturaCredito ? new Date(data.fechaAperturaCredito) : null,
        fechaAvaluo: data.fechaAvaluo ? new Date(data.fechaAvaluo) : null,
        fechaUltimoAvaluo: data.fechaUltimoAvaluo ? new Date(data.fechaUltimoAvaluo) : null,
        fechaAdjudicacion: data.fechaAdjudicacion ? new Date(data.fechaAdjudicacion) : null,
        createdById: req.user!.id,
      },
    });

    // Registrar actividad
    await createActivityLog(
      req.user!.id,
      'CREATE',
      'Property',
      property.id,
      changeDescription || `Creó el inmueble ${property.internalCode}`,
      property.id
    );

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateProperty(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;
    const { changeDescription } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        changeDescription: undefined, // No guardar esto
        importeAdjudicacion: data.importeAdjudicacion ? parseFloat(data.importeAdjudicacion) : null,
        importeAdeudo: data.importeAdeudo ? parseFloat(data.importeAdeudo) : null,
        importeAperturaCredito: data.importeAperturaCredito ? parseFloat(data.importeAperturaCredito) : null,
        importeAvaluo: data.importeAvaluo ? parseFloat(data.importeAvaluo) : null,
        importeUltimoAvaluo: data.importeUltimoAvaluo ? parseFloat(data.importeUltimoAvaluo) : null,
        valorLibros: data.valorLibros ? parseFloat(data.valorLibros) : null,
        fechaRegistro: data.fechaRegistro ? new Date(data.fechaRegistro) : undefined,
        fechaAperturaCredito: data.fechaAperturaCredito ? new Date(data.fechaAperturaCredito) : undefined,
        fechaAvaluo: data.fechaAvaluo ? new Date(data.fechaAvaluo) : undefined,
        fechaUltimoAvaluo: data.fechaUltimoAvaluo ? new Date(data.fechaUltimoAvaluo) : undefined,
        fechaAdjudicacion: data.fechaAdjudicacion ? new Date(data.fechaAdjudicacion) : undefined,
      },
    });

    // Registrar actividad
    await createActivityLog(
      req.user!.id,
      'UPDATE',
      'Property',
      property.id,
      changeDescription || `Actualizó el inmueble ${property.internalCode}`,
      property.id
    );

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteProperty(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });
    
    if (property) {
      await createActivityLog(
        req.user!.id,
        'DELETE',
        'Property',
        property.id,
        `Eliminó el inmueble ${property.internalCode}`
      );
    }

    await prisma.property.delete({ where: { id } });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function searchProperties(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      q, status, estado, municipio, tipoCredito,
      minImporte, maxImporte, fechaDesde, fechaHasta,
      page = '1', limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { internalCode: { contains: q as string, mode: 'insensitive' } },
        { ubicacionMigrada: { contains: q as string, mode: 'insensitive' } },
        { propietarioNombre: { contains: q as string, mode: 'insensitive' } },
        { municipio: { contains: q as string, mode: 'insensitive' } },
        { observaciones: { contains: q as string, mode: 'insensitive' } },
        { numeroExpediente: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (estado) where.estado = { contains: estado as string, mode: 'insensitive' };
    if (municipio) where.municipio = { contains: municipio as string, mode: 'insensitive' };
    if (tipoCredito) where.tipoCredito = { contains: tipoCredito as string, mode: 'insensitive' };

    if (minImporte || maxImporte) {
      where.importeAdjudicacion = {
        ...(minImporte ? { gte: parseFloat(minImporte as string) } : {}),
        ...(maxImporte ? { lte: parseFloat(maxImporte as string) } : {}),
      };
    }

    if (fechaDesde || fechaHasta) {
      where.fechaAdjudicacion = {
        ...(fechaDesde ? { gte: new Date(fechaDesde as string) } : {}),
        ...(fechaHasta ? { lte: new Date(fechaHasta as string) } : {}),
      };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { fullName: true } },
          _count: { select: { files: true, expedientes: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      data: properties,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getExpedientes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const expedientes = await prisma.expediente.findMany({
      where: { propertyId: id },
      include: {
        files: { include: { uploadedBy: { select: { fullName: true } } } },
      },
      orderBy: { numero: 'asc' },
    });
    res.json(expedientes);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createExpediente(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { titulo, descripcion, adjudicadoPor, numero } = req.body;

    const lastExp = await prisma.expediente.findFirst({
      where: { propertyId: id },
      orderBy: { numero: 'desc' },
    });

    const expediente = await prisma.expediente.create({
      data: {
        numero: numero || (lastExp ? lastExp.numero + 1 : 1),
        titulo,
        descripcion,
        adjudicadoPor,
        propertyId: id,
      },
    });

    res.status(201).json(expediente);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateExpediente(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { expId } = req.params;
    const expediente = await prisma.expediente.update({
      where: { id: expId },
      data: req.body,
    });
    res.json(expediente);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteExpediente(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { expId } = req.params;
    await prisma.expediente.delete({ where: { id: expId } });
    res.json({ message: 'Expediente deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
