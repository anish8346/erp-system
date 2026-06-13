import prisma from '../../core/config/prisma.js';
import { logActivity } from '../../core/utils/logger.js';

export class PurchaseService {
  static async createPurchaseOrder(data: any, userId?: string) {
    const { vendorId, vendorName, orderLines } = data;
    if (!vendorName || !orderLines?.length) {
      throw new Error('Vendor and products are required for procurement.');
    }

    const totalAmount = orderLines.reduce((acc: number, line: any) => acc + (line.quantity * line.price), 0);
    
    const po = await prisma.purchaseOrder.create({
      data: {
        vendorId,
        vendorName,
        status: 'DRAFT',
        totalAmount,
        orderLines: {
          create: orderLines.map((line: any) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            price: Number(line.price),
          })),
        },
      },
      include: { orderLines: true },
    });

    if (userId) {
      await logActivity(userId, 'CREATE', 'PURCHASE_ORDER', po.id, `Created procurement order for vendor ${vendorName}`);
    }

    return po;
  }

  static async receivePurchaseOrder(id: string, items: any[], userId?: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { orderLines: true },
    });

    if (!po) throw new Error('Purchase Order not found.');
    if (po.status === 'RECEIVED') throw new Error('Order already fully received.');

    await prisma.$transaction(async (tx) => {
      let allReceived = true;

      for (const line of po.orderLines) {
        const itemToReceive = items?.find((i: any) => i.lineId === line.id);
        const qtyToReceive = itemToReceive ? Number(itemToReceive.quantity) : 0;

        if (qtyToReceive > 0) {
          const remainingToReceive = line.quantity - line.receivedQty;
          if (qtyToReceive > remainingToReceive) {
            throw new Error(`Cannot receive ${qtyToReceive} for ${line.productId}. Only ${remainingToReceive} remaining.`);
          }

          await tx.product.update({
            where: { id: line.productId },
            data: { qtyOnHand: { increment: qtyToReceive } },
          });

          await tx.purchaseOrderLine.update({
            where: { id: line.id },
            data: { receivedQty: { increment: qtyToReceive } }
          });

          await tx.stockLedger.create({
            data: {
              productId: line.productId,
              quantityChange: qtyToReceive,
              type: 'PURCHASE',
              referenceId: po.id,
            },
          });
        }

        const updatedLine = await tx.purchaseOrderLine.findUnique({ where: { id: line.id } });
        if (updatedLine && updatedLine.receivedQty < updatedLine.quantity) {
          allReceived = false;
        }
      }

      await tx.purchaseOrder.update({
        where: { id },
        data: { status: allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED' },
      });
    });

    if (userId) {
        await logActivity(userId, 'RECEIVE', 'PURCHASE_ORDER', id, `Processed receipt for procurement order from ${po.vendorName}`);
    }
  }

  static async getPurchaseOrders() {
    return await prisma.purchaseOrder.findMany({
      include: { orderLines: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createVendor(data: { name: string, email?: string, phone?: string, address?: string }, userId?: string) {
    const { name, email, phone, address } = data;
    const vendor = await prisma.vendor.create({
      data: { name, email, phone, address }
    });

    if (userId) {
      await logActivity(userId, 'CREATE', 'VENDOR', vendor.id, `Created vendor: ${name}`);
    }

    return vendor;
  }

  static async getVendors() {
    return await prisma.vendor.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async updateVendor(id: string, data: { name?: string, email?: string, phone?: string, address?: string }, userId?: string) {
    const vendor = await prisma.vendor.update({
      where: { id },
      data
    });

    if (userId) {
      await logActivity(userId, 'UPDATE', 'VENDOR', id, `Updated vendor: ${vendor.name}`);
    }

    return vendor;
  }
}
