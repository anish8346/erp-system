
import { Router } from 'express';
import { createVendor, getVendors, updateVendor } from '../controllers/vendorController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createVendor);
router.get('/', authenticate, getVendors);
router.put('/:id', authenticate, updateVendor);

export default router;
