import { Router } from 'express';
import { createMO, produceMO, getMOs, updateWorkOrderStatus } from '../controllers/manufacturingController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createMO);
router.get('/', getMOs);
router.post('/:id/produce', authenticate, produceMO);
router.patch('/work-order/:id/status', authenticate, updateWorkOrderStatus);

export default router;
