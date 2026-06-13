import { Router } from 'express';
import { createPurchaseOrder, getPurchaseOrders, receivePurchaseOrder } from '../controllers/purchaseController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createPurchaseOrder);
router.get('/', getPurchaseOrders);
router.post('/:id/receive', authenticate, receivePurchaseOrder);

export default router;
