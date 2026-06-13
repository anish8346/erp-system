import prisma from '../../core/config/prisma.js';
import { logActivity } from '../../core/utils/logger.js';

export const createProduct = async (data: any, userId?: string) => {
  const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId, bomId, qtyOnHand } = data;
  if (!name) throw new Error('Product name is required.');

  const initialQty = Number(qtyOnHand) || 0;

  const product = await prisma.product.create({
    data: {
      name,
      salesPrice: Number(salesPrice) || 0,
      costPrice: Number(costPrice) || 0,
      procurementType: procurementType || 'MTS',
      supplyMethod: supplyMethod || 'PURCHASE',
      vendorId: vendorId || null,
      bomId,
      qtyOnHand: initialQty,
      qtyReserved: 0,
    },
  });

  if (userId) {
    await logActivity(userId, 'CREATE', 'PRODUCT', product.id, `Created product: ${product.name} with initial stock ${initialQty}`);
  }

  if (initialQty > 0) {
    await prisma.stockLedger.create({
      data: {
        productId: product.id,
        quantityChange: initialQty,
        type: 'INITIAL',
        referenceId: 'INITIAL_STOCK',
      }
    });
  }

  return product;
};

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: { vendor: true }
  });
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: true,
      BoM: {
        include: {
          bomLines: {
            include: { component: true }
          }
        }
      }
    }
  });
  if (!product) throw new Error('Product not found.');
  return product;
};

export const updateProduct = async (id: string, data: any, userId?: string) => {
  const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId } = data;
  
  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      salesPrice: Number(salesPrice),
      costPrice: Number(costPrice),
      procurementType,
      supplyMethod,
      vendorId: vendorId || null,
    },
  });

  if (userId) {
    await logActivity(userId, 'UPDATE', 'PRODUCT', id, `Updated product details for ${name}`);
  }

  return product;
};

export const deleteProduct = async (id: string, userId?: string) => {
  const linesCount = await prisma.salesOrderLine.count({ where: { productId: id } });
  if (linesCount > 0) {
    throw new Error('Cannot delete: This product has historical Sales Orders linked to it.');
  }

  const product = await prisma.product.delete({ where: { id } });

  if (userId) {
    await logActivity(userId, 'DELETE', 'PRODUCT', id, `Deleted product: ${product.name}`);
  }

  return product;
};

export const adjustStock = async (id: string, adjustment: number, reason: string, userId?: string) => {
  if (!adjustment || isNaN(adjustment)) {
    throw new Error('A valid adjustment quantity is required.');
  }

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id },
      data: { qtyOnHand: { increment: adjustment } }
    });

    await tx.stockLedger.create({
      data: {
        productId: id,
        quantityChange: adjustment,
        type: 'ADJUSTMENT',
        referenceId: reason || 'MANUAL_ADJUSTMENT',
      }
    });

    return p;
  });

  if (userId) {
    await logActivity(userId, 'ADJUST_STOCK', 'PRODUCT', id, `Manually adjusted stock for ${product.name} by ${adjustment}. Reason: ${reason}`);
  }

  return product;
};

export const getStockLedger = async () => {
  return await prisma.stockLedger.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
};
