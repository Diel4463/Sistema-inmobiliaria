import { Router } from 'express';
import { authenticateToken } from '../auth/auth.middleware';
import { getActivityLogs, getPropertyLogs, getActivityStats } from './activities.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/activities - Obtener todos los logs
router.get('/', getActivityLogs);

// GET /api/activities/stats - Obtener estadísticas
router.get('/stats', getActivityStats);

// GET /api/activities/property/:propertyId - Obtener logs de una propiedad
router.get('/property/:propertyId', getPropertyLogs);

export default router;
