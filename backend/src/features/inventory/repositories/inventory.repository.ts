import prisma from '../../../core/database/prisma.js';
import type { CreateProductData, UpdateProductData, StockLedgerType } from '../../../core/types/index.js';

export class InventoryRepository {
  async createProduct(data: CreateProductData) {
    const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId, bomId, qtyOnHand } = data;
    return await prisma.product.create({
      data: {
        name,
        salesPrice: Number(salesPrice) || 0,
        costPrice: Number(costPrice) || 0,
        procurementType: procurementType || 'MTS',
        supplyMethod: supplyMethod || 'PURCHASE',
        vendorId: vendorId || null,
        bomId,
        qtyOnHand: Number(qtyOnHand) || 0,
        qtyReserved: 0,
      },
    });
  }

  async createStockLedgerEntry(productId: string, quantityChange: number, type: StockLedgerType, referenceId: string) {
    return await prisma.stockLedger.create({
      data: {
        productId,
        quantityChange,
        type,
        referenceId,
      }
    });
  }

  async findAllProducts(filters: { page: number; limit: number; searchTerm?: string }) {
    const { page, limit, searchTerm } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { id: { contains: searchTerm, mode: 'insensitive' } },
        { vendor: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { vendor: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }

  async findProductById(id: string) {
    return await prisma.product.findUnique({
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
  }

  async updateProduct(id: string, data: UpdateProductData) {
    const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId } = data;
    return await prisma.product.update({
      where: { id },
      data: {
        name,
        salesPrice: salesPrice !== undefined ? Number(salesPrice) : undefined,
        costPrice: costPrice !== undefined ? Number(costPrice) : undefined,
        procurementType,
        supplyMethod,
        vendorId: vendorId || null,
      },
    });
  }

  async countSalesOrderLines(productId: string) {
    return await prisma.salesOrderLine.count({ where: { productId } });
  }

  async deleteProduct(id: string) {
    return await prisma.product.delete({ where: { id } });
  }

  async adjustStockTransaction(id: string, adjustment: number, reason: string) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
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

      return product;
    });
  }

  async findAllStockLedgerEntries() {
    return await prisma.stockLedger.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const inventoryRepository = new InventoryRepository();
