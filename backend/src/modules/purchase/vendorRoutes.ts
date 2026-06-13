
import { Router } from 'express';
import { createVendor, getVendors, updateVendor } from './vendorController.js';
import { authenticate } from '../../core/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createVendor);
router.get('/', authenticate, getVendors);
router.put('/:id', authenticate, updateVendor);

export default router;
