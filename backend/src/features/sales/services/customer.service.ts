import { CustomerRepository } from '../repositories/customer.repository.js';
import { logActivity } from '../../../core/utils/logger.js';

export class CustomerService {
  static async createCustomer(data: { name: string; address?: string; mobile?: string }, userId?: string) {
    const customer = await CustomerRepository.createCustomer(data);
    if (userId) {
      await logActivity(userId, 'CREATE', 'CUSTOMER', customer.id, `Added customer: ${customer.name}`);
    }
    return customer;
  }

  static async getCustomers(filters: { page: number; limit: number; searchTerm?: string }) {
    return await CustomerRepository.findCustomers(filters);
  }

  static async getCustomerById(id: string) {
    return await CustomerRepository.findCustomerById(id);
  }

  static async updateCustomer(id: string, data: any, userId?: string) {
    const customer = await CustomerRepository.updateCustomer(id, data);
    if (userId) {
      await logActivity(userId, 'UPDATE', 'CUSTOMER', id, `Updated details for customer: ${customer.name}`);
    }
    return customer;
  }

  static async deleteCustomer(id: string, userId?: string) {
    const customer = await CustomerRepository.findCustomerById(id);
    await CustomerRepository.deleteCustomer(id);
    if (userId && customer) {
      await logActivity(userId, 'DELETE', 'CUSTOMER', id, `Removed customer: ${customer.name}`);
    }
  }
}
