import prisma from '../../core/config/prisma.js';

export class AdministrationService {
  static async getAuditLogs() {
    return await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createWorkCenter(name: string) {
    return await prisma.workCenter.create({ data: { name } });
  }

  static async getWorkCenters() {
    return await prisma.workCenter.findMany();
  }

  static async getUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
  }

  static async submitRequest(data: { name: string, email: string, company: string, message: string }) {
    return await prisma.accessRequest.create({
      data
    });
  }

  static async getRequests() {
    return await prisma.accessRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateRequestStatus(id: string, status: string) {
    return await prisma.accessRequest.update({
      where: { id },
      data: { status }
    });
  }
}
