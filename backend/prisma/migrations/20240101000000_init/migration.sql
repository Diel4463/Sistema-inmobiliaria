-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'SOLD', 'PENDING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'WORD', 'IMAGE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ubicacionMigrada" TEXT,
    "denominado" TEXT,
    "viasDeAcceso" TEXT,
    "usoActual" TEXT,
    "superficieTerreno" TEXT,
    "superficieConstruccion" TEXT,
    "noContaAgua" BOOLEAN NOT NULL DEFAULT false,
    "noContaPredial" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "propertyType" TEXT DEFAULT 'CASA HABITACIONAL',
    "category" TEXT DEFAULT 'MXP UNIFAMILIARES',
    "libros" TEXT,
    "numeroExpediente" TEXT,
    "tipoCredito" TEXT,
    "rfcDeudor" TEXT,
    "soporteGravamen" TEXT,
    "fechaRegistro" TIMESTAMP(3),
    "importeAdjudicacion" DECIMAL(18,2),
    "importeAdeudo" DECIMAL(18,2),
    "fechaAperturaCredito" TIMESTAMP(3),
    "importeAperturaCredito" DECIMAL(18,2),
    "fechaAvaluo" TIMESTAMP(3),
    "importeAvaluo" DECIMAL(18,2),
    "fechaUltimoAvaluo" TIMESTAMP(3),
    "importeUltimoAvaluo" DECIMAL(18,2),
    "fechaAdjudicacion" TIMESTAMP(3),
    "valorLibros" DECIMAL(18,2),
    "calle" TEXT,
    "colonia" TEXT,
    "municipio" TEXT,
    "estado" TEXT,
    "cp" TEXT,
    "pais" TEXT DEFAULT 'MEXICO',
    "propietarioNombre" TEXT,
    "numeroBienes" INTEGER DEFAULT 1,
    "centroCostos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expedientes" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "adjudicadoPor" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expedientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "propertyId" TEXT,
    "expedienteId" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "properties_internalCode_key" ON "properties"("internalCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "expedientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
