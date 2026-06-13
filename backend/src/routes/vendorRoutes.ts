
import { Router } from 'express';
import { createVendor, getVendors, updateVendor } from '../controllers/vendorController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createVendor);
router.get('/', authenticate, getVendors);
router.put('/:id', authenticate, updateVendor);

export default router;
