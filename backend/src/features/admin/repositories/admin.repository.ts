import prisma from '../../../core/database/prisma.js';

export class AdminRepository {
  static async getAuditLogs(filters: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    module?: string;
    action?: string;
  }) {
    const { page, limit, startDate, endDate, userId, module, action } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (userId && userId !== 'all') {
      where.userId = userId;
    }

    if (module && module !== 'all') {
      where.entityType = module;
    }

    if (action && action !== 'all') {
      where.action = { contains: action };
    }

    const [logs, totalItems, summaryCounts] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { _all: true },
      }),
    ]);

    const summary = {
      total: totalItems,
      create: 0,
      update: 0,
      delete: 0,
    };

    summaryCounts.forEach((item) => {
      const act = item.action.toUpperCase();
      if (act.includes('CREATE') || act.includes('POST')) {
        summary.create += item._count._all;
      } else if (act.includes('UPDATE') || act.includes('PUT') || act.includes('PATCH')) {
        summary.update += item._count._all;
      } else if (act.includes('DELETE')) {
        summary.delete += item._count._all;
      }
    });

    return {
      logs,
      summary,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }

  static async createWorkCenter(name: string) {
    return prisma.workCenter.create({ data: { name } });
  }

  static async getWorkCenters() {
    return prisma.workCenter.findMany();
  }

  static async getUsers(role?: string) {
    return prisma.user.findMany({
      where: role ? { role } : {},
      orderBy: { name: 'asc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
  }

  static async submitRequest(data: { name: string, email: string, company: string, message: string }) {
    return prisma.accessRequest.create({
      data
    });
  }

  static async getRequests() {
    return prisma.accessRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateRequestStatus(id: string, status: string) {
    return prisma.accessRequest.update({
      where: { id },
      data: { status }
    });
  }
}
