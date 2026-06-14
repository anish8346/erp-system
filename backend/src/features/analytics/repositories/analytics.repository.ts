import prisma from '../../../core/database/prisma.js';

export class AnalyticsRepository {
  static async getAllSalesLines() {
    return await prisma.salesOrderLine.findMany();
  }

  static async getAllPurchaseLines() {
    return await prisma.purchaseOrderLine.findMany();
  }

  static async getAllSalesOrders() {
    return await prisma.salesOrder.findMany({
      include: { orderLines: true },
      where: { status: { in: ['CONFIRMED', 'PARTIALLY_DELIVERED', 'DELIVERED'] } },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getAllPurchaseOrders() {
    return await prisma.purchaseOrder.findMany({
      include: { orderLines: true },
      where: { status: { in: ['CONFIRMED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'RECEIVED'] } },
      orderBy: { createdAt: 'asc' }
    });
  }
}
