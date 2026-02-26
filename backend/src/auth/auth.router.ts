import { Router } from 'express';
import { login, getMe, refreshToken } from './auth.controller';
import { authenticateToken } from './auth.middleware';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/me', authenticateToken, getMe);
authRouter.post('/refresh', authenticateToken, refreshToken);
