
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Search, Filter, Clock, User as UserIcon, Calendar, RefreshCcw, PlusCircle, Edit, Trash2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import type { AuditLog, AuditLogSummary, PaginationMeta, User } from '../types';

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditLogSummary>({ total: 0, create: 0, update: 0, delete: 0 });
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, totalPages: 0, totalItems: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    startDate: '',
    endDate: '',
    userId: 'all',
    module: 'all',
    action: 'all'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/config/users');
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logParams: any = { page: filters.page, limit: 20 };
      if (filters.startDate) logParams.startDate = filters.startDate;
      if (filters.endDate) logParams.endDate = filters.endDate;
      if (filters.userId !== 'all') logParams.userId = filters.userId;
      if (filters.module !== 'all') logParams.module = filters.module;
      if (filters.action !== 'all') logParams.action = filters.action;

      const res = await api.get('/config/audit-logs', { params: logParams });
      setLogs(res.data.logs);
      setSummary(res.data.summary);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      page: 1,
      startDate: '',
      endDate: '',
      userId: 'all',
      module: 'all',
      action: 'all'
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Audit Logs</h2>
          <p className="text-warm-taupe text-sm font-medium">Monitor system activities and maintain security compliance.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-soft-cream flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Secured</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm p-6 flex flex-col justify-center">
          <p className="text-xs font-bold text-warm-taupe uppercase tracking-wider">Total Logs</p>
          <p className="text-3xl font-black text-luxury-brown">{summary.total}</p>
        </Card>
        <Card className="bg-white border-none shadow-sm p-6 flex flex-col justify-center">
          <p className="text-xs font-bold text-warm-taupe uppercase tracking-wider">Create Actions</p>
          <p className="text-3xl font-black text-luxury-brown">{summary.create}</p>
        </Card>
        <Card className="bg-white border-none shadow-sm p-6 flex flex-col justify-center">
          <p className="text-xs font-bold text-warm-taupe uppercase tracking-wider">Update Actions</p>
          <p className="text-3xl font-black text-luxury-brown">{summary.update}</p>
        </Card>
        <Card className="bg-white border-none shadow-sm p-6 flex flex-col justify-center">
          <p className="text-xs font-bold text-warm-taupe uppercase tracking-wider">Delete Actions</p>
          <p className="text-3xl font-black text-luxury-brown">{summary.delete}</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-lg bg-white/50 backdrop-blur-md">
        {/* Advanced Filters */}
        <div className="p-4 border-b border-soft-cream bg-white grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-warm-taupe uppercase px-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-taupe/60" />
              <input 
                type="date"
                className="w-full pl-9 pr-3 py-1.5 bg-faded-white border border-soft-cream rounded-lg text-xs font-medium focus:ring-2 focus:ring-luxury-brown/10 outline-none transition-all"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-warm-taupe uppercase px-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-taupe/60" />
              <input 
                type="date"
                className="w-full pl-9 pr-3 py-1.5 bg-faded-white border border-soft-cream rounded-lg text-xs font-medium focus:ring-2 focus:ring-luxury-brown/10 outline-none transition-all"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-warm-taupe uppercase px-1">User</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-taupe/60" />
              <select 
                className="w-full pl-9 pr-3 py-1.5 bg-faded-white border border-soft-cream rounded-lg text-xs font-medium focus:ring-2 focus:ring-luxury-brown/10 outline-none transition-all appearance-none"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value, page: 1 }))}
              >
                <option value="all">All Users</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-warm-taupe uppercase px-1">Module</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-taupe/60" />
              <select 
                className="w-full pl-9 pr-3 py-1.5 bg-faded-white border border-soft-cream rounded-lg text-xs font-medium focus:ring-2 focus:ring-luxury-brown/10 outline-none transition-all appearance-none"
                value={filters.module}
                onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value, page: 1 }))}
              >
                <option value="all">All Modules</option>
                <option value="PRODUCT">Products</option>
                <option value="SALES_ORDER">Sales</option>
                <option value="PURCHASE_ORDER">Purchase</option>
                <option value="MANUFACTURING_ORDER">Manufacturing</option>
                <option value="BOM">BoM</option>
                <option value="STOCK">Stock</option>
                <option value="AUTH">Auth</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-warm-taupe uppercase px-1">Action</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-taupe/60" />
              <select 
                className="w-full pl-9 pr-3 py-1.5 bg-faded-white border border-soft-cream rounded-lg text-xs font-medium focus:ring-2 focus:ring-luxury-brown/10 outline-none transition-all appearance-none"
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value, page: 1 }))}
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full h-[34px] font-bold text-xs gap-2"
              onClick={handleReset}
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-faded-white/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Time & Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Entity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-luxury-brown/20 border-t-luxury-brown rounded-full animate-spin"></div>
                      <p className="text-warm-taupe font-bold">Fetching latest activities...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {logs.map((log) => (
                    <tr key={log.id} className="group hover:bg-faded-white/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-warm-taupe/60" />
                          <div>
                            <p className="text-sm font-medium text-luxury-brown">{new Date(log.createdAt).toLocaleDateString()}</p>
                            <p className="text-[10px] font-bold text-warm-taupe/60">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center border border-soft-cream">
                            <UserIcon className="w-4 h-4 text-warm-taupe" />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{log.user?.name || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          log.action.includes('CREATE') || log.action.includes('POST') ? 'success' :
                          log.action.includes('UPDATE') || log.action.includes('PUT') || log.action.includes('PATCH') ? 'warning' :
                          log.action.includes('DELETE') ? 'danger' : 'neutral'
                        }>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-luxury-brown uppercase tracking-tight">{log.entityType}</span>
                          <span className="text-[10px] font-mono text-warm-taupe/60">ID: {log.entityId.slice(0,8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-gray-600 font-medium max-w-xs ml-auto line-clamp-1 group-hover:line-clamp-none transition-all">
                          {log.details}
                        </p>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-warm-taupe/60 font-bold text-lg">No audit logs found</p>
                        <p className="text-warm-taupe/60 text-sm mt-1">Try adjusting your filters or search terms.</p>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-soft-cream bg-white flex items-center justify-between">
          <p className="text-xs font-bold text-warm-taupe">
            Showing <span className="text-luxury-brown">{logs.length}</span> of <span className="text-luxury-brown">{pagination.totalItems}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={filters.page === 1 || loading}
              onClick={() => handlePageChange(filters.page - 1)}
              className="px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show only current page, first, last, and neighbors
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        filters.page === pageNum 
                          ? 'bg-luxury-brown text-white shadow-md' 
                          : 'bg-faded-white text-warm-taupe hover:bg-soft-cream'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === filters.page - 2 || 
                  pageNum === filters.page + 2
                ) {
                  return <span key={pageNum} className="text-warm-taupe text-xs">...</span>;
                }
                return null;
              })}
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={filters.page === pagination.totalPages || loading}
              onClick={() => handlePageChange(filters.page + 1)}
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogs;
