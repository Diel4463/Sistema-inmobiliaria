import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@inmobiliaria.com',
      password: adminPassword,
      fullName: 'Administrador General',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('Admin user created:', admin.username);

  const sampleProperty = await prisma.property.upsert({
    where: { internalCode: '23581' },
    update: {},
    create: {
      internalCode: '23581',
      status: 'SOLD',
      propietarioNombre: 'GUILLERMO GONZALEZ ZARZA',
      ubicacionMigrada: 'AV. RIO LERMA SUR NO. 4 VIVIENDA 6-4 COL. BELLAVISTA FRACC PRADOS DE CUAUTITLAN CP 54710',
      calle: 'AV LERMA SUR NO 4 VIVIENDA 6A',
      colonia: 'BELLAS VISTA FRACC. PRADOS DE CUAUTITLAN',
      municipio: 'CUAUTITLAN IZCALLI',
      estado: 'ESTADO DE MEXICO',
      cp: '54710',
      viasDeAcceso: 'AUTOPISTA MEXICO QUERETARO, AV. CHALMA, AV. LA AURORA Y AV. DEL TRABAJO',
      usoActual: 'HABITACIONAL',
      superficieTerreno: '114M2',
      superficieConstruccion: '79.91M2',
      observaciones: 'NO. BUC: 02692962',
      numeroBienes: 1,
      libros: 'BANCO SANTANDER (MEXICO) S.A.',
      numeroExpediente: '2692962',
      tipoCredito: 'HIPOTECARIO',
      centroCostos: '3144',
      valorLibros: 0,
      fechaAdjudicacion: new Date('2014-05-29'),
      propertyType: 'CASA HABITACIONAL',
      category: 'MXP UNIFAMILIARES',
      createdById: admin.id,
    },
  });

  console.log('Sample property created:', sampleProperty.internalCode);
  console.log('Seeding completed!');
  console.log('\n=== DEFAULT CREDENTIALS ===');
  console.log('Username: admin');
  console.log('Password: Admin123!');
  console.log('===========================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
