// frontend/src/pages/Users.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { Button, Modal, Input, ConfirmDialog } from '../components/UI';
import type { User, UserRole, PaginationMeta } from '../types';
import axios from 'axios';

// Sub-components
import UsersList from './users/UsersList';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, totalPages: 0, totalItems: 0 });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES' as UserRole
  });

  const [errorAlert, setErrorAlert] = useState<{title: string, message: string} | null>(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const userParams: any = { page, limit: 20 };
      if (searchTerm) userParams.searchTerm = searchTerm;
      if (roleFilter !== 'all') userParams.role = roleFilter;

      const res = await api.get('/config/users', { params: userParams });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch users", err);
      setErrorAlert({ title: "Fetch Failed", message: "Unable to retrieve the workforce list." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, roleFilter]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'SALES' });
      fetchUsers(1);
    } catch (err: unknown) {
      let errorMsg = "Failed to create user. Email might already exist.";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Onboarding Failed", message: errorMsg });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Team & Access</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage employee identities, roles, and system permissions.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Access Vault Secured</span>
            </div>
            <Button onClick={() => setShowModal(true)} variant="primary" className="shadow-sm">
                <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
            </Button>
        </div>
      </div>

      <UsersList 
        users={users}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Onboard New Employee">
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input 
               label="Full Name *" 
               placeholder="e.g. Rahul Sharma"
               value={formData.name}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
               required
             />
             <Input 
               label="Email Address *" 
               type="email"
               placeholder="rahul@shivfurniture.com"
               value={formData.email}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
               required
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input 
               label="Access Password *" 
               type="password"
               placeholder="••••••••"
               value={formData.password}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
               required
             />
             <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">System Role *</label>
                <select 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium"
                    value={formData.role}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value as UserRole})}
                    required
                >
                    <option value="ADMIN">Master Admin</option>
                    <option value="OWNER">Business Owner</option>
                    <option value="SALES">Sales Representative</option>
                    <option value="PURCHASE">Procurement Officer</option>
                    <option value="MFG">Manufacturing Lead</option>
                    <option value="INVENTORY">Warehouse Manager</option>
                </select>
             </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Grant System Access</Button>
           </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!errorAlert}
        onClose={() => setErrorAlert(null)}
        onConfirm={() => setErrorAlert(null)}
        title={errorAlert?.title || "Alert"}
        description={errorAlert?.message || ""}
        confirmText="Acknowledged"
        isAlert={true}
        variant="warning"
      />
    </div>
  );
};

export default Users;
