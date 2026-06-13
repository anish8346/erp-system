import { Router } from 'express';
import { getFinancialSummary } from './financeController.js';
import { authenticate } from '../../core/middlewares/authMiddleware.js';

const router = Router();

router.get('/summary', authenticate, getFinancialSummary);

export default router;
