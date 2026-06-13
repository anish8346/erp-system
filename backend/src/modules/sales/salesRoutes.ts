import { Router } from 'express';
import { createSalesOrder, confirmSalesOrder, deliverSalesOrder, getSalesOrders } from './salesController.js';
import { authenticate } from '../../core/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createSalesOrder);
router.get('/', getSalesOrders);
router.post('/:id/confirm', authenticate, confirmSalesOrder);
router.post('/:id/deliver', authenticate, deliverSalesOrder);

export default router;
