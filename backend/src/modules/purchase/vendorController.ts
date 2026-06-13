import type { Response } from 'express';
import type { AuthRequest } from '../../core/middlewares/authMiddleware.js';
import { PurchaseService } from './purchase.service.js';

export const createVendor = async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await PurchaseService.createVendor(req.body, req.user?.id);
    res.status(201).json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getVendors = async (req: AuthRequest, res: Response) => {
  try {
    const vendors = await PurchaseService.getVendors();
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVendor = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const vendor = await PurchaseService.updateVendor(id, req.body, req.user?.id);
    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
