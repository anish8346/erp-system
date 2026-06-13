import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { logActivity } from '../utils/logger';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId, bomId, qtyOnHand } = req.body;
    const initialQty = Number(qtyOnHand) || 0;

    const product = await prisma.product.create({
      data: {
        name,
        salesPrice,
        costPrice,
        procurementType,
        supplyMethod,
        vendorId: vendorId || null,
        bomId,
        qtyOnHand: initialQty,
        qtyReserved: 0,
      },
    });

    // Log the activity
    if (req.user) {
      await logActivity(req.user.id, 'CREATE', 'PRODUCT', product.id, `Created product: ${product.name} with initial stock ${initialQty}`);
    }

    // If initial stock is provided, create a ledger entry
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

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        BoM: {
          include: {
            bomLines: {
              include: { component: true }
            }
          }
        }
      }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId } = req.body;
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        salesPrice,
        costPrice,
        procurementType,
        supplyMethod,
        vendorId: vendorId || null,
      },
    });

    if (req.user) {
      await logActivity(req.user.id, 'UPDATE', 'PRODUCT', id, `Updated product details for ${name}`);
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if product is in use
    const linesCount = await prisma.salesOrderLine.count({ where: { productId: id } });
    if (linesCount > 0) {
      return res.status(400).json({ error: 'Cannot delete product: It is linked to existing Sales Orders.' });
    }

    const product = await prisma.product.delete({ where: { id } });

    if (req.user) {
      await logActivity(req.user.id, 'DELETE', 'PRODUCT', id, `Deleted product: ${product.name}`);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adjustment, reason } = req.body; 
    
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: { qtyOnHand: { increment: Number(adjustment) } }
      });

      await tx.stockLedger.create({
        data: {
          productId: id,
          quantityChange: Number(adjustment),
          type: 'ADJUSTMENT',
          referenceId: reason || 'MANUAL_ADJUSTMENT',
        }
      });

      return p;
    });

    if (req.user) {
      await logActivity(req.user.id, 'ADJUST_STOCK', 'PRODUCT', id, `Manually adjusted stock for ${product.name} by ${adjustment}. Reason: ${reason}`);
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStockLedger = async (req: Request, res: Response) => {
  try {
    const ledger = await prisma.stockLedger.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ledger);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
