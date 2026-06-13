
import { Router } from 'express';
import { getFinancialSummary } from '../controllers/financeController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/summary', authenticate, getFinancialSummary);

export default router;
