
import { Response, Request } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { logActivity } from '../utils/logger';

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { vendorId, vendorName, orderLines } = req.body;
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
            quantity: line.quantity,
            price: line.price,
          })),
        },
      },
      include: { orderLines: true },
    });

    if (req.user) {
      await logActivity(req.user.id, 'CREATE', 'PURCHASE_ORDER', po.id, `Created procurement order for vendor ${vendorName}`);
    }

    res.status(201).json(po);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const receivePurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // items: [{ lineId: string, quantity: number }]

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { orderLines: true },
    });

    if (!po) return res.status(404).json({ error: 'Purchase Order not found' });
    if (po.status === 'RECEIVED') return res.status(400).json({ error: 'Order already fully received' });

    // Transaction to update stock and ledger
    await prisma.$transaction(async (tx) => {
      let allReceived = true;

      for (const line of po.orderLines) {
        const itemToReceive = items?.find((i: any) => i.lineId === line.id);
        const qtyToReceive = itemToReceive ? Number(itemToReceive.quantity) : 0;

        if (qtyToReceive > 0) {
          const remainingToReceive = line.quantity - line.receivedQty;
          if (qtyToReceive > remainingToReceive) {
            throw new Error(`Cannot receive more than remaining quantity for line ${line.id}`);
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

        // Check if this line is now fully received
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

    if (req.user) {
        await logActivity(req.user.id, 'RECEIVE', 'PURCHASE_ORDER', id, `Processed receipt for procurement order from ${po.vendorName}`);
    }

    res.json({ message: 'Receipt processed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPurchaseOrders = async (req: Request, res: Response) => {
    try {
      const orders = await prisma.purchaseOrder.findMany({
        include: { orderLines: { include: { product: true } } },
      });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};
