import { Response } from 'express';
import { PrismaClient, FileType } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../auth/auth.middleware';

const prisma = new PrismaClient();

function getFileType(mimetype: string): FileType {
  if (mimetype === 'application/pdf') return FileType.PDF;
  if (mimetype.includes('word') || mimetype.includes('document')) return FileType.WORD;
  if (mimetype.startsWith('image/')) return FileType.IMAGE;
  return FileType.OTHER;
}

export async function uploadFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { propertyId, expedienteId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    const createdFiles = await Promise.all(
      files.map(async (file) => {
        return prisma.file.create({
          data: {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            fileType: getFileType(file.mimetype),
            propertyId,
            expedienteId: expedienteId || null,
            uploadedById: req.user!.id,
          },
          include: { uploadedBy: { select: { fullName: true } } },
        });
      })
    );

    res.status(201).json(createdFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    // Delete from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await prisma.file.delete({ where: { id: fileId } });
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    if (!fs.existsSync(file.path)) {
      res.status(404).json({ message: 'File not found on disk' });
      return;
    }

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
