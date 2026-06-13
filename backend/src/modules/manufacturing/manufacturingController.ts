import type { Request, Response } from 'express';
import type { AuthRequest } from '../../core/middlewares/authMiddleware.js';
import { ManufacturingService } from './manufacturing.service.js';

export const createMO = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, bomId } = req.body;
    if (!productId || !bomId) {
      return res.status(400).json({ error: 'Product and BoM are required to plan production.' });
    }
    
    const mo = await ManufacturingService.createMO({
        productId,
        quantity,
        bomId,
        userId: req.user?.id
    });

    res.status(201).json(mo);
  } catch (error: any) {
    console.error('[CreateMO Error]:', error);
    res.status(500).json({ error: 'Failed to create manufacturing order.' });
  }
};

export const produceMO = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await ManufacturingService.produceMO(id, req.user?.id);
    res.json(result);
  } catch (error: any) {
    console.error('[ProduceMO Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to finalize production.' });
  }
};

export const updateWorkOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const wo = await ManufacturingService.updateWorkOrderStatus(id, status, req.user?.id);
    res.json(wo);
  } catch (error: any) {
    console.error('[UpdateWOStatus Error]:', error);
    res.status(500).json({ error: 'Failed to update work step status.' });
  }
};

export const getMOs = async (req: Request, res: Response) => {
    try {
      const mos = await ManufacturingService.getMOs();
      res.json(mos);
    } catch (error: any) {
      console.error('[GetMOs Error]:', error);
      res.status(500).json({ error: 'Failed to retrieve manufacturing orders.' });
    }
};
