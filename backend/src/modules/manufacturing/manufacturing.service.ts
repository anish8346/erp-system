import prisma from '../../core/config/prisma.js';
import { logActivity } from '../../core/utils/logger.js';

export class ManufacturingService {
  static async createBoM(data: { productId: string, name: string, components: any[], operations: any[] }) {
    const { productId, name, components, operations } = data;
    
    const bom = await prisma.$transaction(async (tx) => {
      const existingBom = await tx.boM.findUnique({ where: { productId } });
      
      if (existingBom) {
        await tx.boMLine.deleteMany({ where: { bomId: existingBom.id } });
        await tx.operation.deleteMany({ where: { bomId: existingBom.id } });
        
        return await tx.boM.update({
          where: { id: existingBom.id },
          data: {
            name,
            bomLines: {
              create: components.map((c: any) => ({
                componentId: c.componentId,
                quantity: Number(c.quantity),
              })),
            },
            operations: {
              create: (operations || []).map((o: any) => ({
                name: o.name,
                duration: Number(o.duration),
                workCenterId: o.workCenterId,
              })),
            },
          },
          include: { bomLines: true, operations: true },
        });
      } else {
        return await tx.boM.create({
          data: {
            productId,
            name,
            bomLines: {
              create: components.map((c: any) => ({
                componentId: c.componentId,
                quantity: Number(c.quantity),
              })),
            },
            operations: {
              create: (operations || []).map((o: any) => ({
                name: o.name,
                duration: Number(o.duration),
                workCenterId: o.workCenterId,
              })),
            },
          },
          include: { bomLines: true, operations: true },
        });
      }
    });

    await prisma.product.update({
      where: { id: productId },
      data: { bomId: bom.id },
    });

    return bom;
  }

  static async getBoMs() {
    return await prisma.boM.findMany({
      include: {
        product: true,
        bomLines: { include: { component: true } },
      },
    });
  }

  static async createMO(data: { productId: string, quantity: number, bomId: string, userId?: string }) {
    const { productId, quantity, bomId, userId } = data;
    
    const bom = await prisma.boM.findUnique({
      where: { id: bomId },
      include: { operations: true }
    });

    const mo = await prisma.manufacturingOrder.create({
      data: {
        productId,
        quantity: Number(quantity),
        bomId,
        status: 'DRAFT',
        WorkOrders: {
          create: (bom?.operations || []).map(op => ({
            operationId: op.id,
            status: 'PENDING',
            duration: op.duration * Number(quantity),
          }))
        }
      },
    });

    if (userId) {
      await logActivity(userId, 'CREATE', 'MO', mo.id, `Planned production for ${quantity} units with ${bom?.operations.length || 0} work steps`);
    }

    return mo;
  }

  static async produceMO(id: string, userId?: string) {
    const mo = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: { 
        bom: { include: { bomLines: { include: { component: true } } } },
        product: true,
        WorkOrders: true
      },
    });

    if (!mo) throw new Error('MO not found.');
    if (mo.status === 'DONE') throw new Error('Production already marked as complete.');

    const allWorkOrdersDone = mo.WorkOrders.every(wo => wo.status === 'DONE');
    if (mo.WorkOrders.length > 0 && !allWorkOrdersDone) {
      throw new Error('Cannot finalize: Some work steps are still in progress.');
    }

    await prisma.$transaction(async (tx) => {
      for (const line of mo.bom.bomLines) {
        const requiredQty = line.quantity * mo.quantity;
        
        const component = await tx.product.findUnique({
          where: { id: line.componentId }
        });

        if (!component || component.qtyOnHand < requiredQty) {
          throw new Error(`Insufficient stock for component: ${component?.name || 'Unknown'}. Needed: ${requiredQty}, have: ${component?.qtyOnHand || 0}`);
        }

        await tx.product.update({
          where: { id: line.componentId },
          data: { qtyOnHand: { decrement: requiredQty } },
        });

        await tx.stockLedger.create({
          data: {
            productId: line.componentId,
            quantityChange: -requiredQty,
            type: 'MFG_CONSUME',
            referenceId: mo.id,
          },
        });
      }

      await tx.product.update({
        where: { id: mo.productId },
        data: { 
            qtyOnHand: { increment: mo.quantity },
            qtyReserved: { decrement: mo.quantity > mo.product.qtyReserved ? mo.product.qtyReserved : mo.quantity }
        },
      });

      await tx.stockLedger.create({
        data: {
          productId: mo.productId,
          quantityChange: mo.quantity,
          type: 'MFG_PRODUCE',
          referenceId: mo.id,
        },
      });

      await tx.manufacturingOrder.update({
        where: { id },
        data: { status: 'DONE' },
      });
    });

    if (userId) {
      await logActivity(userId, 'PRODUCE', 'MO', id, `Completed production of ${mo.quantity} ${mo.product.name}`);
    }

    return { message: 'Production completed successfully.' };
  }

  static async updateWorkOrderStatus(id: string, status: string, userId?: string) {
    const wo = await prisma.workOrder.update({
      where: { id },
      data: { status },
      include: { mo: { include: { product: true } }, operation: true }
    });

    if (userId) {
      await logActivity(userId, 'UPDATE_STATUS', 'WORK_ORDER', id, `Updated ${wo.operation.name} for ${wo.mo.product.name} to ${status}`);
    }

    return wo;
  }

  static async getMOs() {
    return await prisma.manufacturingOrder.findMany({
      include: { product: true, bom: true, WorkOrders: { include: { operation: { include: { workCenter: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
