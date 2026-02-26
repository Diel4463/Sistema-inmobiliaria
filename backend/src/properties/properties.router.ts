import { Router } from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getExpedientes,
  createExpediente,
  updateExpediente,
  deleteExpediente,
} from './properties.controller';
import { authenticateToken, requireEditorOrAdmin, requireAdmin } from '../auth/auth.middleware';

export const propertiesRouter = Router();

propertiesRouter.use(authenticateToken);

propertiesRouter.get('/', getProperties);
propertiesRouter.get('/search', searchProperties);
propertiesRouter.get('/:id', getProperty);
propertiesRouter.post('/', requireEditorOrAdmin, createProperty);
propertiesRouter.put('/:id', requireEditorOrAdmin, updateProperty);
propertiesRouter.delete('/:id', requireAdmin, deleteProperty);

// Expedientes
propertiesRouter.get('/:id/expedientes', getExpedientes);
propertiesRouter.post('/:id/expedientes', requireEditorOrAdmin, createExpediente);
propertiesRouter.put('/:id/expedientes/:expId', requireEditorOrAdmin, updateExpediente);
propertiesRouter.delete('/:id/expedientes/:expId', requireAdmin, deleteExpediente);
