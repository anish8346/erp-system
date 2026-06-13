import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { logActivity } from '../utils/logger';

export const createSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, orderLines } = req.body; // orderLines: [{ productId, quantity, price }]
    
    const totalAmount = orderLines.reduce((acc: number, line: any) => acc + (line.quantity * line.price), 0);
    
    const so = await prisma.salesOrder.create({
      data: {
        customerName,
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
      await logActivity(req.user.id, 'CREATE', 'SALES_ORDER', so.id, `Created draft sales order for ${customerName}`);
    }
    
    res.status(201).json(so);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const confirmSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const so = await prisma.salesOrder.findUnique({
      where: { id },
      include: { orderLines: { include: { product: true } } },
    });
    
    if (!so) return res.status(404).json({ error: 'Sales Order not found' });
    if (so.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT orders can be confirmed' });

    // Business Logic: Reservation and Procurement Trigger
    for (const line of so.orderLines) {
      const product = line.product;
      const freeToUse = product.qtyOnHand - product.qtyReserved;
      
      if (freeToUse >= line.quantity) {
        // Reserve stock
        await prisma.product.update({
          where: { id: product.id },
          data: { qtyReserved: product.qtyReserved + line.quantity }
        });
      } else {
        const shortage = line.quantity - freeToUse;
        
        // Reserve whatever is available
        if (freeToUse > 0) {
           await prisma.product.update({
            where: { id: product.id },
            data: { qtyReserved: product.qtyReserved + freeToUse }
          });
        }

        // MTO Trigger Logic
        if (product.procurementType === 'MTO') {
          if (product.supplyMethod === 'MANUFACTURE' && product.bomId) {
            // Auto-create Manufacturing Order
            await prisma.manufacturingOrder.create({
              data: {
                productId: product.id,
                quantity: shortage,
                status: 'CONFIRMED',
                bomId: product.bomId,
              }
            });
          } else if (product.supplyMethod === 'PURCHASE') {
            // Auto-create Purchase Order
            await prisma.purchaseOrder.create({
              data: {
                vendorName: 'Auto-Generated Vendor', // Simplified for MVP
                status: 'DRAFT',
                totalAmount: shortage * product.costPrice,
                orderLines: {
                  create: [{
                    productId: product.id,
                    quantity: shortage,
                    price: product.costPrice,
                  }]
                }
              }
            });
          }
        }
      }
    }

    const updatedSO = await prisma.salesOrder.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    if (req.user) {
        await logActivity(req.user.id, 'CONFIRM', 'SALES_ORDER', id, `Confirmed sales order for ${so.customerName}`);
    }

    res.json(updatedSO);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deliverSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // items: [{ lineId: string, quantity: number }]
    
    const so = await prisma.salesOrder.findUnique({
      where: { id },
      include: { orderLines: true },
    });
    
    if (!so) return res.status(404).json({ error: 'Sales Order not found' });
    if (so.status !== 'CONFIRMED' && so.status !== 'PARTIALLY_DELIVERED') {
      return res.status(400).json({ error: 'Only CONFIRMED or PARTIALLY_DELIVERED orders can be delivered' });
    }

    await prisma.$transaction(async (tx) => {
      let allDelivered = true;

      for (const line of so.orderLines) {
        const itemToDeliver = items?.find((i: any) => i.lineId === line.id);
        const qtyToDeliver = itemToDeliver ? Number(itemToDeliver.quantity) : 0;
        
        if (qtyToDeliver > 0) {
          const remainingToDeliver = line.quantity - line.deliveredQty;
          if (qtyToDeliver > remainingToDeliver) {
            throw new Error(`Cannot deliver more than remaining quantity for line ${line.id}`);
          }

          // Decrease both OnHand and Reserved
          await tx.product.update({
            where: { id: line.productId },
            data: { 
              qtyOnHand: { decrement: qtyToDeliver },
              qtyReserved: { decrement: qtyToDeliver }
            }
          });

          await tx.salesOrderLine.update({
            where: { id: line.id },
            data: { deliveredQty: { increment: qtyToDeliver } }
          });

          await tx.stockLedger.create({
            data: {
              productId: line.productId,
              quantityChange: -qtyToDeliver,
              type: 'SALE',
              referenceId: so.id,
            },
          });
        }

        // Check if this line is now fully delivered after our update
        const updatedLine = await tx.salesOrderLine.findUnique({ where: { id: line.id } });
        if (updatedLine && updatedLine.deliveredQty < updatedLine.quantity) {
          allDelivered = false;
        }
      }

      await tx.salesOrder.update({
        where: { id },
        data: { status: allDelivered ? 'DELIVERED' : 'PARTIALLY_DELIVERED' },
      });
    });

    if (req.user) {
        await logActivity(req.user.id, 'DELIVER', 'SALES_ORDER', id, `Processed delivery for order ${so.customerName}`);
    }

    res.json({ message: 'Delivery processed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSalesOrders = async (req: Request, res: Response) => {
    try {
      const orders = await prisma.salesOrder.findMany({
        include: { orderLines: { include: { product: true } } },
      });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};
