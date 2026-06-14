import type { Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import { CustomerService } from '../services/customer.service.js';

export class CustomerController {
  static async createCustomer(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user?.id);
      res.status(201).json(customer);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async getCustomers(req: AuthRequest, res: Response) {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        searchTerm: req.query.searchTerm as string,
      };
      const result = await CustomerService.getCustomers(filters);
      res.json(result);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Failed to fetch customer list.' });
    }
  }

  static async updateCustomer(req: AuthRequest, res: Response) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body, req.user?.id);
      res.json(customer);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async deleteCustomer(req: AuthRequest, res: Response) {
    try {
      await CustomerService.deleteCustomer(req.params.id, req.user?.id);
      res.json({ message: 'Customer deleted successfully.' });
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
}
