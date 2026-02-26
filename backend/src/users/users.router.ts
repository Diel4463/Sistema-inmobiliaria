import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from './users.controller';
import { authenticateToken, requireAdmin } from '../auth/auth.middleware';

export const usersRouter = Router();

usersRouter.use(authenticateToken);

usersRouter.get('/', requireAdmin, getUsers);
usersRouter.post('/', requireAdmin, createUser);
usersRouter.put('/:id', requireAdmin, updateUser);
usersRouter.delete('/:id', requireAdmin, deleteUser);
usersRouter.post('/change-password', changePassword);
