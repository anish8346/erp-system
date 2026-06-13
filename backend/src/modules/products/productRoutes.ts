import { Router } from 'express';
import { createProduct, getProducts, getProductById, getStockLedger, updateProduct, deleteProduct, adjustStock } from './productController.js';
import { authenticate } from '../../core/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createProduct);
router.get('/', getProducts);
router.get('/ledger', getStockLedger);
router.get('/:id', getProductById);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.patch('/:id/adjust-stock', authenticate, adjustStock);

export default router;
