import { Router } from 'express';
import { createMO, produceMO, getMOs, updateWorkOrderStatus } from '../controllers/manufacturingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createMO);
router.get('/', getMOs);
router.post('/:id/produce', authenticate, produceMO);
router.patch('/work-order/:id/status', authenticate, updateWorkOrderStatus);

export default router;
