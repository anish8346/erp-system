import type { Request, Response } from 'express';
import { AdministrationService } from './administration.service.js';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AdministrationService.getAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createWorkCenter = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const wc = await AdministrationService.createWorkCenter(name);
      res.status(201).json(wc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};

export const getWorkCenters = async (req: Request, res: Response) => {
    try {
      const wcs = await AdministrationService.getWorkCenters();
      res.json(wcs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await AdministrationService.getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
