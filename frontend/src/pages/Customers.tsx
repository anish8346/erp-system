import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, User, Phone, MapPin, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button, Modal, Input, ConfirmDialog, Badge } from '../components/UI';
import type { Customer, PaginationMeta } from '../types';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, totalPages: 0, totalItems: 0 });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobile: '',
  });

  const [errorAlert, setErrorAlert] = useState<{title: string, message: string} | null>(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { page, limit: 20, searchTerm } });
      setCustomers(res.data.customers);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      setErrorAlert({ title: "Fetch Failed", message: "Unable to retrieve the customer list." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({ name: '', address: '', mobile: '' });
      fetchData(1);
    } catch (err: unknown) {
      let errorMsg = "Failed to create customer.";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Operation Failed", message: errorMsg });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Customer Directory</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage client relationships and delivery details.</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="primary" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    placeholder="Search by name, mobile or address..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium ml-auto">
                <Filter className="w-3.5 h-3.5" />
                <span>{pagination.totalItems} Customers total</span>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Customer Name</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Mobile Number</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Delivery Address</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                  <tr>
                      <td colSpan={4} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-luxury-brown/20 border-t-luxury-brown rounded-full animate-spin"></div>
                              <p className="text-gray-400 font-bold">Accessing directory...</p>
                          </div>
                      </td>
                  </tr>
              ) : (
                <>
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-luxury-brown/10 group-hover:text-luxury-brown transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-900">{c.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {c.mobile || '---'}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium max-w-xs truncate">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {c.address || '---'}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-luxury-brown hover:bg-gray-100 rounded-lg transition-colors text-[10px] font-black uppercase tracking-widest">
                            Edit
                        </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-400 text-sm italic font-medium">No customers found.</td>
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
            Showing <span className="text-gray-900">{customers.length}</span> of <span className="text-gray-900">{pagination.totalItems}</span> customers
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
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
                      onClick={() => handlePageChange(pageNum)}
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
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-2 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Customer Entry">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Customer Name *" 
            placeholder="Full Name" 
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Mobile Number" 
            placeholder="+91 XXXXX XXXXX" 
            value={formData.mobile}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, mobile: e.target.value})}
          />
          <Input 
            label="Delivery Address" 
            placeholder="Full Address" 
            value={formData.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, address: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Register Customer</Button>
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

export default Customers;
