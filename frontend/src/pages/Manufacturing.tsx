// frontend/src/pages/Manufacturing.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button, ConfirmDialog } from '../components/UI';
import type { ManufacturingOrder, Product, BoM, User, PaginationMeta } from '../types';
import axios from 'axios';

// Sub-components
import ManufacturingList from './manufacturing/ManufacturingList';
import ManufacturingDetail from './manufacturing/ManufacturingDetail';
import ManufacturingForm from './manufacturing/ManufacturingForm';

const Manufacturing = () => {
  const [mos, setMos] = useState<ManufacturingOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, totalPages: 0, totalItems: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BoM[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [currentMO, setCurrentMO] = useState<ManufacturingOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const [newMO, setNewMO] = useState({
    productId: '',
    quantity: 1,
    bomId: '',
    assigneeId: '',
  });

  const [errorAlert, setErrorAlert] = useState<{title: string, message: string} | null>(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [mosRes, productsRes, bomsRes, usersRes] = await Promise.all([
        api.get('/manufacturing', { params: { page, limit: 20, searchTerm } }),
        api.get('/products'),
        api.get('/boms'),
        api.get('/config/users'),
      ]);
      
      // Extract data safely, checking for both old and new API formats
      setMos(mosRes.data.mos || []);
      setPagination(mosRes.data.pagination || { page: 1, limit: 20, totalPages: 1, totalItems: 0 });
      
      const prodData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.products || []);
      setProducts(prodData);
      
      setBoms(Array.isArray(bomsRes.data) ? bomsRes.data : (bomsRes.data?.boms || []));
      
      const userData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []);
      setUsers(userData);
    } catch (err) {
      console.error("Fetch manufacturing data failed", err);
      setErrorAlert({ title: "Connection Error", message: "Failed to load manufacturing data. Please check your connection." });
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
      await api.post('/manufacturing', newMO);
      setShowForm(false);
      setNewMO({ productId: '', quantity: 1, bomId: '', assigneeId: '' });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Failed to create manufacturing order";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Order Creation Failed", message: errorMsg });
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/manufacturing/${id}/confirm`);
      fetchData();
      refreshCurrentMO(id);
    } catch (err: unknown) {
      let errorMsg = "Confirmation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Action Failed", message: errorMsg });
    }
  };

  const handleProduce = async (id: string) => {
    try {
      await api.post(`/manufacturing/${id}/produce`);
      fetchData();
      refreshCurrentMO(id);
    } catch (err: unknown) {
      let errorMsg = "Production failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Action Failed", message: errorMsg });
    }
  };

  const handleCancel = async () => {
    if (!orderToCancel) return;
    try {
      await api.post(`/manufacturing/${orderToCancel}/cancel`);
      fetchData();
      refreshCurrentMO(orderToCancel);
    } catch (err: unknown) {
      let errorMsg = "Cancellation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      setErrorAlert({ title: "Action Failed", message: errorMsg });
    }
  };

  const refreshCurrentMO = async (id: string) => {
    const res = await api.get('/manufacturing');
    const mos = Array.isArray(res.data) ? res.data : (res.data?.mos || []);
    const updated = mos.find((m: ManufacturingOrder) => m.id === id);
    if (updated) setCurrentMO(updated);
  };

  const updateWOStatus = async (woId: string, status: string) => {
    try {
      await api.patch(`/manufacturing/work-order/${woId}/status`, { status });
      if (currentMO) refreshCurrentMO(currentMO.id);
      fetchData();
    } catch (err: unknown) {
      setErrorAlert({ title: "Update Failed", message: "Failed to update work order status." });
    }
  };

  const updateWODuration = async (woId: string, duration: number) => {
    try {
      await api.patch(`/manufacturing/work-order/${woId}/duration`, { realDuration: duration });
      if (currentMO) refreshCurrentMO(currentMO.id);
      fetchData();
    } catch (err: unknown) {
      setErrorAlert({ title: "Update Failed", message: "Failed to update operation duration." });
    }
  };

  const updateConsumedQty = async (compId: string, consumed: number) => {
    try {
      await api.patch(`/manufacturing/component/${compId}/consumed`, { consumed });
      if (currentMO) refreshCurrentMO(currentMO.id);
      fetchData();
    } catch (err: unknown) {
      setErrorAlert({ title: "Update Failed", message: "Failed to update consumed quantity." });
    }
  };

  const openDetail = (mo: ManufacturingOrder) => {
    setCurrentMO(mo);
    setView('detail');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {view === 'list' ? (
        <>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Manufacturing Orders</h2>
              <p className="text-gray-500 text-sm mt-1 font-medium">Plan, track, and manage your production floor activities.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Shop Floor Secure</span>
              </div>
              <Button onClick={() => setShowForm(true)} variant="primary" className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Plan Production
              </Button>
            </div>
          </div>

          <ManufacturingList 
            mos={mos} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onOpenDetail={openDetail} 
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      ) : currentMO && (
        <ManufacturingDetail 
          currentMO={currentMO}
          onBack={() => setView('list')}
          onConfirm={handleConfirm}
          onProduce={handleProduce}
          onCancel={(id) => { setOrderToCancel(id); setShowCancelConfirm(true); }}
          updateConsumedQty={updateConsumedQty}
          updateWOStatus={updateWOStatus}
          updateWODuration={updateWODuration}
        />
      )}

      <ManufacturingForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        newMO={newMO}
        setNewMO={setNewMO}
        products={products}
        boms={boms}
        users={users}
      />

      <ConfirmDialog 
        isOpen={showCancelConfirm}
        onClose={() => { setShowCancelConfirm(false); setOrderToCancel(null); }}
        onConfirm={handleCancel}
        title="Cancel Manufacturing Order"
        description="Are you sure you want to cancel this production order? This action cannot be undone."
        confirmText="Cancel Order"
        variant="danger"
      />
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

export default Manufacturing;
