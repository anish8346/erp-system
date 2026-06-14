import { AdminRepository } from '../repositories/admin.repository.js';

export class AdminService {
  static async getAuditLogs(filters: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    module?: string;
    action?: string;
  }) {
    return AdminRepository.getAuditLogs(filters);
  }

  static async createWorkCenter(name: string) {
    return AdminRepository.createWorkCenter(name);
  }

  static async getWorkCenters() {
    return AdminRepository.getWorkCenters();
  }

  static async getUsers(filters: { page: number; limit: number; searchTerm?: string; role?: string }) {
    return AdminRepository.getUsers(filters);
  }

  static async submitRequest(data: { name: string, email: string, company: string, message: string }) {
    return AdminRepository.submitRequest(data);
  }

  static async getRequests() {
    return AdminRepository.getRequests();
  }

  static async updateRequestStatus(id: string, status: string) {
    return AdminRepository.updateRequestStatus(id, status);
  }
}
