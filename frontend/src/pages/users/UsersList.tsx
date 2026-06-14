import React from 'react';
import { Search, Filter, UserCircle2, Shield, Mail, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, Button } from '../../components/UI';
import type { User, PaginationMeta } from '../../types';

interface UsersListProps {
  users: User[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  loading: boolean;
}

const UsersList = ({ 
  users, 
  searchTerm, 
  onSearchChange, 
  roleFilter, 
  onRoleChange, 
  pagination, 
  onPageChange, 
  loading 
}: UsersListProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Filters Bar */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-48">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:ring-1 focus:ring-gray-300 font-medium"
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
            <option value="SALES">Sales</option>
            <option value="PURCHASE">Purchase</option>
            <option value="MFG">Manufacturing</option>
            <option value="INVENTORY">Inventory</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium ml-auto">
          <Filter className="w-3.5 h-3.5" />
          <span>{pagination.totalItems} Staff members found</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Employee Name</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Email Address</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">System Role</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Joined Date</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-luxury-brown/20 border-t-luxury-brown rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-bold">Fetching team data...</p>
                        </div>
                    </td>
                </tr>
            ) : (
                <>
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-luxury-brown/10 group-hover:text-luxury-brown transition-colors">
                            <UserCircle2 className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900">{user.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.email}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'OWNER' ? 'gold' : user.role === 'SALES' ? 'purple' : 'neutral'}>
                            {user.role}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '---'}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-luxury-brown hover:bg-gray-100 rounded-lg transition-colors text-[10px] font-black uppercase tracking-widest">
                            Manage Access
                        </button>
                    </td>
                    </tr>
                ))}
                {users.length === 0 && (
                    <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <UserCircle2 className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm font-medium">No team members found.</p>
                    </td>
                    </tr>
                )}
                </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400">
            Showing <span className="text-gray-900">{users.length}</span> of <span className="text-gray-900">{pagination.totalItems}</span> staff
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === 1 || loading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-2 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        pagination.page === pageNum 
                          ? 'bg-luxury-brown text-white shadow-sm' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.page - 2 || 
                  pageNum === pagination.page + 2
                ) {
                  return <span key={pageNum} className="text-gray-400 text-xs mx-0.5">...</span>;
                }
                return null;
              })}
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === pagination.totalPages || loading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-2 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
    </div>
  );
};

export default UsersList;
