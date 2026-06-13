import { Router } from 'express';
import { createSalesOrder, confirmSalesOrder, deliverSalesOrder, getSalesOrders } from '../controllers/salesController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createSalesOrder);
router.get('/', getSalesOrders);
router.post('/:id/confirm', authenticate, confirmSalesOrder);
router.post('/:id/deliver', authenticate, deliverSalesOrder);

export default router;
