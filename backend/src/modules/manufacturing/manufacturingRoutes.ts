import { Router } from 'express';
import { createMO, produceMO, getMOs, updateWorkOrderStatus } from './manufacturingController.js';
import { authenticate } from '../../core/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createMO);
router.get('/', getMOs);
router.post('/:id/produce', authenticate, produceMO);
router.patch('/work-order/:id/status', authenticate, updateWorkOrderStatus);

export default router;
