import prisma from '../../core/config/prisma.js';
import { logActivity } from '../../core/utils/logger.js';

export const createSalesOrder = async (data: any, userId?: string) => {
  const { customerName, orderLines } = data;
  if (!customerName || !orderLines?.length) {
    throw new Error('Customer name and at least one product are required.');
  }
  
  const totalAmount = orderLines.reduce((acc: number, line: any) => acc + (line.quantity * line.price), 0);
  
  const so = await prisma.salesOrder.create({
    data: {
      customerName,
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
    await logActivity(userId, 'CREATE', 'SALES_ORDER', so.id, `Created draft sales order for ${customerName}`);
  }
  
  return so;
};

export const confirmSalesOrder = async (id: string, userId?: string) => {
  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: { orderLines: { include: { product: true } } },
  });
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'DRAFT') throw new Error('Only DRAFT orders can be confirmed.');

  for (const line of so.orderLines) {
    const product = line.product;
    const freeToUse = product.qtyOnHand - product.qtyReserved;
    
    if (freeToUse >= line.quantity) {
      await prisma.product.update({
        where: { id: product.id },
        data: { qtyReserved: product.qtyReserved + line.quantity }
      });
    } else {
      const shortage = line.quantity - freeToUse;
      
      if (freeToUse > 0) {
         await prisma.product.update({
          where: { id: product.id },
          data: { qtyReserved: product.qtyReserved + freeToUse }
        });
      }

      if (product.procurementType === 'MTO') {
        if (product.supplyMethod === 'MANUFACTURE' && product.bomId) {
          await prisma.manufacturingOrder.create({
            data: {
              productId: product.id,
              quantity: shortage,
              status: 'CONFIRMED',
              bomId: product.bomId,
            }
          });
        } else if (product.supplyMethod === 'PURCHASE') {
          await prisma.purchaseOrder.create({
            data: {
              vendorName: 'Auto-Generated Vendor',
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

  if (userId) {
      await logActivity(userId, 'CONFIRM', 'SALES_ORDER', id, `Confirmed sales order for ${so.customerName}`);
  }

  return updatedSO;
};

export const deliverSalesOrder = async (id: string, items: any[], userId?: string) => {
  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: { orderLines: true },
  });
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'CONFIRMED' && so.status !== 'PARTIALLY_DELIVERED') {
    throw new Error('Order must be CONFIRMED or PARTIALLY_DELIVERED for dispatch.');
  }

  await prisma.$transaction(async (tx) => {
    let allDelivered = true;

    for (const line of so.orderLines) {
      const itemToDeliver = items?.find((i: any) => i.lineId === line.id);
      const qtyToDeliver = itemToDeliver ? Number(itemToDeliver.quantity) : 0;
      if (qtyToDeliver > 0) {
        const remainingToDeliver = line.quantity - line.deliveredQty;
        if (qtyToDeliver > remainingToDeliver) {
          throw new Error(`Cannot deliver ${qtyToDeliver} for ${line.productId}. Only ${remainingToDeliver} remaining.`);
        }

        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product || product.qtyOnHand < qtyToDeliver) {
          throw new Error(`Insufficient physical stock for ${product?.name || 'product'}. Required: ${qtyToDeliver}, Available: ${product?.qtyOnHand || 0}`);
        }

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

  if (userId) {
      await logActivity(userId, 'DELIVER', 'SALES_ORDER', id, `Processed dispatch for order ${so.customerName}`);
  }
};

export const getSalesOrders = async () => {
  return await prisma.salesOrder.findMany({
    include: { orderLines: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });
};
