import type { Request, Response } from 'express';
import { AdministrationService } from './administration.service.js';

export const submitRequest = async (req: Request, res: Response) => {
  try {
    const accessRequest = await AdministrationService.submitRequest(req.body);
    res.status(201).json({ message: 'Request submitted successfully', id: accessRequest.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await AdministrationService.getRequests();
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await AdministrationService.updateRequestStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
