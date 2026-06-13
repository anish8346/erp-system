import { Router } from 'express';
import { createPurchaseOrder, getPurchaseOrders, receivePurchaseOrder } from './purchaseController.js';
import { authenticate } from '../../core/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createPurchaseOrder);
router.get('/', getPurchaseOrders);
router.post('/:id/receive', authenticate, receivePurchaseOrder);

export default router;
