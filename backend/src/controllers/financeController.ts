
import type { Response } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Calculate Revenue (Sum of delivered items value)
    const salesLines = await prisma.salesOrderLine.findMany();
    const totalRevenue = salesLines.reduce((acc, line) => acc + (line.deliveredQty * line.price), 0);

    // 2. Calculate Expenses (Sum of received items value)
    const purchaseLines = await prisma.purchaseOrderLine.findMany();
    const totalExpenses = purchaseLines.reduce((acc, line) => acc + (line.receivedQty * line.price), 0);

    // 3. Calculate Net Profit
    const netProfit = totalRevenue - totalExpenses;

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      currency: 'INR'
    });
  } catch (error: any) {
    console.error('[FinanceSummary Error]:', error);
    res.status(500).json({ error: 'Failed to calculate financial metrics.' });
  }
};
