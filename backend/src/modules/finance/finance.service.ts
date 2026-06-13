import prisma from '../../core/config/prisma.js';

export class FinanceService {
  static async getFinancialSummary() {
    // 1. Calculate Revenue (Sum of delivered items value)
    const salesLines = await prisma.salesOrderLine.findMany();
    const totalRevenue = salesLines.reduce((acc, line) => acc + (line.deliveredQty * line.price), 0);

    // 2. Calculate Expenses (Sum of received items value)
    const purchaseLines = await prisma.purchaseOrderLine.findMany();
    const totalExpenses = purchaseLines.reduce((acc, line) => acc + (line.receivedQty * line.price), 0);

    // 3. Calculate Net Profit
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      currency: 'INR'
    };
  }
}
