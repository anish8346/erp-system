import type { Request, Response } from 'express';
import { ManufacturingService } from './manufacturing.service.js';

export const createBoM = async (req: Request, res: Response) => {
  try {
    const bom = await ManufacturingService.createBoM(req.body);
    res.status(201).json(bom);
  } catch (error: any) {
    console.error("BoM Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBoMs = async (req: Request, res: Response) => {
  try {
    const boms = await ManufacturingService.getBoMs();
    res.json(boms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
