import { Router } from 'express';
import { exportPropertiesCSV, exportPropertiesPDF, getStats } from './reports.controller';
import { authenticateToken } from '../auth/auth.middleware';

export const reportsRouter = Router();

reportsRouter.use(authenticateToken);

reportsRouter.get('/stats', getStats);
reportsRouter.get('/export/csv', exportPropertiesCSV);
reportsRouter.get('/export/pdf', exportPropertiesPDF);
