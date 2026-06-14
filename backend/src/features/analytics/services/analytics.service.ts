import { AnalyticsRepository } from '../repositories/analytics.repository.js';

export class AnalyticsService {
  static async getFinancialSummary() {
    const salesLines = await AnalyticsRepository.getAllSalesLines();
    const totalRevenue = salesLines.reduce((acc, line) => acc + (line.deliveredQty * line.price), 0);

    const purchaseLines = await AnalyticsRepository.getAllPurchaseLines();
    const totalExpenses = purchaseLines.reduce((acc, line) => acc + (line.receivedQty * line.price), 0);

    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      currency: 'INR'
    };
  }

  static async getFinancialCharts() {
    try {
      const sales = await AnalyticsRepository.getAllSalesOrders();
      const purchases = await AnalyticsRepository.getAllPurchaseOrders();

      const dailyMap: Record<string, { date: string, Income: number, Expense: number }> = {};

      sales.forEach(s => {
        if (!s.createdAt) return;
        const date = new Date(s.createdAt).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { date, Income: 0, Expense: 0 };
        dailyMap[date].Income += s.totalAmount || 0;
      });

      purchases.forEach(p => {
        if (!p.createdAt) return;
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { date, Income: 0, Expense: 0 };
        dailyMap[date].Expense += p.totalAmount || 0;
      });

      const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

      const totalIncome = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
      const totalExpense = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);

      const categories = [
        { category: 'SALES', amount: totalIncome },
        { category: 'PURCHASE', amount: totalExpense },
      ];

      return { daily, categories };
    } catch (error) {
      console.error('[AnalyticsService.getFinancialCharts] Error:', error);
      return { daily: [], categories: [] };
    }
  }
}
