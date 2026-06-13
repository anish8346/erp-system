import type { Response, Request } from 'express';
import type { AuthRequest } from '../../core/middlewares/authMiddleware.js';
import { PurchaseService } from './purchase.service.js';

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const po = await PurchaseService.createPurchaseOrder(req.body, req.user?.id);
    res.status(201).json(po);
  } catch (error: any) {
    console.error('[CreatePO Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to create procurement order.' });
  }
};

export const receivePurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { items } = req.body;
    await PurchaseService.receivePurchaseOrder(id, items, req.user?.id);
    res.json({ message: 'Receipt processed successfully.' });
  } catch (error: any) {
    console.error('[ReceivePO Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to process goods receipt.' });
  }
};

export const getPurchaseOrders = async (req: Request, res: Response) => {
    try {
      const orders = await PurchaseService.getPurchaseOrders();
      res.json(orders);
    } catch (error: any) {
      console.error('[GetPOs Error]:', error);
      res.status(500).json({ error: 'Failed to retrieve procurement orders.' });
    }
};
