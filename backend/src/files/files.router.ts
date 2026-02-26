import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile, deleteFile, getFile } from './files.controller';
import { authenticateToken, requireEditorOrAdmin } from '../auth/auth.middleware';

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Accepted: PDF, Word, Images'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export const filesRouter = Router();

filesRouter.use(authenticateToken);

filesRouter.post('/upload/:propertyId', requireEditorOrAdmin, upload.array('files', 10), uploadFile);
filesRouter.post('/upload/:propertyId/expediente/:expedienteId', requireEditorOrAdmin, upload.array('files', 10), uploadFile);
filesRouter.delete('/:fileId', requireEditorOrAdmin, deleteFile);
filesRouter.get('/:fileId', getFile);
