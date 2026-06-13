import prisma from '../../../core/database/prisma.js';
import { logActivity } from '../../../core/utils/logger.js';
import { OperationsRepository } from '../repositories/operations.repository.js';
import type { MOStatus, WOStatus } from '../../../core/types/index.js';

interface BoMComponentInput {
  componentId: string;
  quantity: number | string;
}

interface BoMOperationInput {
  name: string;
  duration: number | string;
  workCenterId: string;
}

interface CreateBoMInput {
  productId: string;
  name: string;
  components: BoMComponentInput[];
  operations: BoMOperationInput[];
}

export class OperationsService {
  static async createBoM(data: CreateBoMInput) {
    const { productId, name, components, operations } = data;
    
    const bom = await prisma.$transaction(async (tx) => {
      const existingBom = await OperationsRepository.findBoMByProductId(productId);
      
      const bomData = {
        product: { connect: { id: productId } },
        name,
        bomLines: {
          create: components.map((c: BoMComponentInput) => ({
            componentId: c.componentId,
            quantity: Number(c.quantity),
          })),
        },
        operations: {
          create: (operations || []).map((o: BoMOperationInput) => ({
            name: o.name,
            duration: Number(o.duration),
            workCenterId: o.workCenterId,
          })),
        },
      };

      if (existingBom) {
        await OperationsRepository.deleteBoMLinesByBomId(existingBom.id, tx);
        await OperationsRepository.deleteOperationsByBomId(existingBom.id, tx);
        
        return await OperationsRepository.updateBoM(existingBom.id, bomData, tx);
      } else {
        return await OperationsRepository.createBoM(bomData, tx);
      }
    });

    await OperationsRepository.updateProductBoM(productId, bom.id);

    return bom;
  }

  static async getBoMs() {
    return await OperationsRepository.getBoMs();
  }

  static async createMO(data: { productId: string, quantity: number, bomId: string, userId?: string }) {
    const { productId, quantity, bomId, userId } = data;
    
    const bom = await OperationsRepository.findBoMById(bomId);

    const mo = await OperationsRepository.createMO({
        product: { connect: { id: productId } },
        quantity: Number(quantity),
        bom: { connect: { id: bomId } },
        status: 'DRAFT',
        WorkOrders: {
          create: (bom?.operations || []).map(op => ({
            operationId: op.id,
            status: 'PENDING',
            duration: op.duration * Number(quantity),
          }))
        }
    });

    if (userId) {
      await logActivity(userId, 'CREATE', 'MO', mo.id, `Planned production for ${quantity} units with ${bom?.operations.length || 0} work steps`);
    }

    return mo;
  }

  static async produceMO(id: string, userId?: string) {
    const mo = await OperationsRepository.findMOById(id);

    if (!mo) throw new Error('MO not found.');
    if (mo.status === 'DONE') throw new Error('Production already marked as complete.');

    const allWorkOrdersDone = mo.WorkOrders.every(wo => wo.status === 'DONE');
    if (mo.WorkOrders.length > 0 && !allWorkOrdersDone) {
      throw new Error('Cannot finalize: Some work steps are still in progress.');
    }

    await prisma.$transaction(async (tx) => {
      if (!mo.bom) throw new Error('BoM not found for this MO.');

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

      const product = await tx.product.findUnique({ where: { id: mo.productId } });
      if (!product) throw new Error('Product not found.');

      await tx.product.update({
        where: { id: mo.productId },
        data: { 
            qtyOnHand: { increment: mo.quantity },
            qtyReserved: { decrement: mo.quantity > product.qtyReserved ? product.qtyReserved : mo.quantity }
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
      await logActivity(userId, 'PRODUCE', 'MO', id, `Completed production of ${mo.quantity} ${mo.product?.name}`);
    }

    return { message: 'Production completed successfully.' };
  }

  static async updateWorkOrderStatus(id: string, status: string, userId?: string) {
    const wo = await OperationsRepository.updateWorkOrder(id, { status: status as WOStatus }); // WOStatus cast if needed

    if (userId) {
      await logActivity(userId, 'UPDATE_STATUS', 'WORK_ORDER', id, `Updated ${wo.operation?.name} for ${wo.mo.product?.name} to ${status}`);
    }

    return wo;
  }

  static async getMOs() {
    return await OperationsRepository.getMOs();
  }
}
