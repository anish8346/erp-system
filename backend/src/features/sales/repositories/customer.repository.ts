import prisma from '../../../core/database/prisma.js';

export class CustomerRepository {
  static async createCustomer(data: { name: string; address?: string; mobile?: string }) {
    return await prisma.customer.create({
      data: {
        name: data.name,
        address: data.address,
        mobile: data.mobile,
      }
    });
  }

  static async findCustomers(filters: { page: number; limit: number; searchTerm?: string }) {
    const { page, limit, searchTerm } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { mobile: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [customers, totalItems] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }

  static async findCustomerById(id: string) {
    return await prisma.customer.findUnique({
      where: { id }
    });
  }

  static async updateCustomer(id: string, data: { name?: string; address?: string; mobile?: string }) {
    return await prisma.customer.update({
      where: { id },
      data
    });
  }

  static async deleteCustomer(id: string) {
    return await prisma.customer.delete({
      where: { id }
    });
  }
}
