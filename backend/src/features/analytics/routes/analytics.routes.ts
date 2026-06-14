import { Router, Response } from 'express';
import { getFinancialSummary } from '../controllers/analytics.controller.js';
import { authenticate, AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import { AnalyticsService } from '../services/analytics.service.js';

export const financeRouter = Router();

financeRouter.get('/summary', authenticate, getFinancialSummary);
financeRouter.get('/charts', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const result = await AnalyticsService.getFinancialCharts();
        res.json(result);
    } catch (error: unknown) {
        console.error('[FinanceCharts Error]:', error);
        res.status(500).json({ error: 'Failed to fetch financial chart data.' });
    }
});
