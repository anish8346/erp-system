import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const configRouter = Router();
configRouter.get('/audit-logs', authenticate, AdminController.getAuditLogs);
configRouter.post('/work-centers', authenticate, AdminController.createWorkCenter);
configRouter.get('/work-centers', authenticate, AdminController.getWorkCenters);
configRouter.get('/users', authenticate, AdminController.getUsers);

export const requestRouter = Router();
requestRouter.post('/submit', AdminController.submitRequest);
requestRouter.get('/', authenticate, AdminController.getRequests);
requestRouter.put('/:id', authenticate, AdminController.updateRequestStatus);

export const userRouter = Router();
userRouter.get('/', authenticate, AdminController.getUsers);
