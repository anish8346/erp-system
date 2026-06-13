import type { Request, Response } from 'express';
import type { AuthRequest } from '../../core/middlewares/authMiddleware.js';
import * as salesService from './sales.service.js';

export const createSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    const so = await salesService.createSalesOrder(req.body, req.user?.id);
    res.status(201).json(so);
  } catch (error: any) {
    console.error('[CreateSalesOrder Error]:', error);
    res.status(error.message.includes('required') ? 400 : 500).json({ error: error.message || 'Failed to create sales order.' });
  }
};

export const confirmSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    const updatedSO = await salesService.confirmSalesOrder(req.params.id, req.user?.id);
    res.json(updatedSO);
  } catch (error: any) {
    console.error('[ConfirmSalesOrder Error]:', error);
    let status = 500;
    if (error.message.includes('not found')) status = 404;
    else if (error.message.includes('Only DRAFT')) status = 400;
    res.status(status).json({ error: error.message || 'Failed during order confirmation.' });
  }
};

export const deliverSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    await salesService.deliverSalesOrder(req.params.id, req.body.items, req.user?.id);
    res.json({ message: 'Delivery processed successfully.' });
  } catch (error: any) {
    console.error('[DeliverSalesOrder Error]:', error);
    let status = 500;
    if (error.message.includes('not found')) status = 404;
    else if (error.message.includes('Order must be')) status = 400;
    else if (error.message.includes('Cannot deliver')) status = 400;
    else if (error.message.includes('Insufficient physical stock')) status = 400;
    res.status(status).json({ error: error.message || 'Failed to process order delivery.' });
  }
};

export const getSalesOrders = async (req: Request, res: Response) => {
    try {
      const orders = await salesService.getSalesOrders();
      res.json(orders);
    } catch (error: any) {
      console.error('[GetSalesOrders Error]:', error);
      res.status(500).json({ error: 'Failed to retrieve sales orders.' });
    }
};
