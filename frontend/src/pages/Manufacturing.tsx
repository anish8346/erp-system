
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Factory, PlayCircle, CheckCircle2, ChevronRight, Activity, Clock, Box, Plus, Search } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';

interface ManufacturingOrder {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  status: string;
  bom: any;
  WorkOrders: any[];
  createdAt: string;
}

const Manufacturing = () => {
  const [mos, setMos] = useState<ManufacturingOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMO, setNewMO] = useState({
    productId: '',
    quantity: 1,
    bomId: '',
  });

  const fetchData = async () => {
    try {
      const [mosRes, productsRes, bomsRes] = await Promise.all([
        api.get('/manufacturing'),
        api.get('/products'),
        api.get('/boms'),
      ]);
      setMos(mosRes.data);
      setProducts(productsRes.data);
      setBoms(bomsRes.data);
    } catch (err) {
      console.error("Fetch manufacturing data failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/manufacturing', newMO);
      setShowForm(false);
      setNewMO({ productId: '', quantity: 1, bomId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create manufacturing order");
    }
  };

  const handleProduce = async (id: string) => {
    try {
      await api.post(`/manufacturing/${id}/produce`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Production failed. Check component stock and work steps.");
    }
  };

  const updateWOStatus = async (woId: string, status: string) => {
    try {
      await api.patch(`/manufacturing/work-order/${woId}/status`, { status });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update work order status");
    }
  };

  const filteredMOs = mos.filter(mo => 
    mo.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mo.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Manufacturing Orders</h2>
          <p className="text-warm-taupe text-sm font-medium">Manage production orders and step-by-step assembly on the shop floor.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="font-semibold">
          <Plus className="w-5 h-5" /> Plan Production
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-soft-cream">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
          <input 
            placeholder="Search by product or order ID..." 
            className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-brown/20 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredMOs.map((mo) => {
          const allStepsDone = mo.WorkOrders?.length > 0 && mo.WorkOrders.every((wo: any) => wo.status === 'DONE');
          const isDone = mo.status === 'DONE';

          return (
            <Card key={mo.id} className={`overflow-hidden transition-all border-l-4 ${isDone ? 'border-l-emerald-500 bg-faded-white/30' : 'border-l-indigo-500 hover:shadow-md'}`}>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Factory className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-luxury-brown text-lg">{mo.product.name}</h3>
                        <Badge variant={isDone ? 'success' : mo.status === 'DRAFT' ? 'neutral' : 'purple'}>
                          {mo.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-warm-taupe font-medium">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] text-gray-600">MO-{mo.id.slice(0,8).toUpperCase()}</span>
                        <span className="flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg text-[11px]"><Box className="w-3.5 h-3.5" /> Qty: {mo.quantity}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-warm-taupe/60" /> {new Date(mo.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    {mo.status !== 'DONE' ? (
                      <div className="flex flex-col items-end gap-2">
                        <Button 
                          disabled={!allStepsDone && mo.WorkOrders?.length > 0} 
                          onClick={() => handleProduce(mo.id)}
                          className={`font-bold ${allStepsDone ? 'shadow-lg shadow-emerald-200' : ''}`}
                          variant={allStepsDone ? 'success' : 'primary'}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Finalize Production
                        </Button>
                        {!allStepsDone && mo.WorkOrders?.length > 0 && (
                           <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                             <Activity className="w-3 h-3" /> Complete all steps first
                           </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Production Finished
                      </span>
                    )}
                  </div>
                </div>

                {/* Work Orders / Steps Flow */}
                {mo.WorkOrders?.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mo.WorkOrders.map((wo: any, idx: number) => (
                      <div key={wo.id} className={`relative p-4 rounded-xl border transition-all ${
                        wo.status === 'DONE' ? 'bg-emerald-50/50 border-emerald-100' : 
                        wo.status === 'IN_PROGRESS' ? 'bg-indigo-50/50 border-indigo-200 ring-4 ring-indigo-500/5' : 
                        'bg-faded-white border-soft-cream'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-[10px] font-bold text-warm-taupe/60 uppercase tracking-wider">Step {idx + 1}</span>
                           {wo.status === 'DONE' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-gray-300" />}
                        </div>
                        <h4 className="font-bold text-luxury-brown text-sm mb-1">{wo.operation.name}</h4>
                        <p className="text-[10px] text-warm-taupe font-bold uppercase mb-4 tracking-tight">{wo.operation.workCenter?.name || 'General Assembly'}</p>
                        
                        <div className="flex gap-2">
                          {wo.status === 'PENDING' && !isDone && (
                            <button 
                              onClick={() => updateWOStatus(wo.id, 'IN_PROGRESS')}
                              className="w-full py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                            >
                              START STEP
                            </button>
                          )}
                          {wo.status === 'IN_PROGRESS' && (
                            <button 
                              onClick={() => updateWOStatus(wo.id, 'DONE')}
                              className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition-colors shadow-md"
                            >
                              FINISH STEP
                            </button>
                          )}
                          {wo.status === 'DONE' && (
                             <span className="w-full py-1.5 text-center text-emerald-600 text-[10px] font-bold uppercase tracking-wider bg-emerald-100/50 rounded-lg">Completed</span>
                          )}
                          {wo.status === 'PENDING' && isDone && (
                             <span className="w-full py-1.5 text-center text-warm-taupe/60 text-[10px] font-bold uppercase tracking-wider bg-gray-100 rounded-lg">Skipped</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {(!mo.WorkOrders || mo.WorkOrders.length === 0) && mo.status !== 'DONE' && (
                   <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                      <Activity className="w-5 h-5 text-amber-500" />
                      <p className="text-xs font-semibold text-amber-700">No production steps defined in Bill of Materials. You can finalize this order directly.</p>
                   </div>
                )}
              </div>
            </Card>
          );
        })}
        {filteredMOs.length === 0 && (
           <div className="text-center py-20 bg-faded-white rounded-2xl border-2 border-dashed border-soft-cream">
              <Factory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-warm-taupe font-bold text-lg">No manufacturing orders found</p>
              <p className="text-warm-taupe/60 text-sm mt-1">Plan your next production run to keep the shop floor busy.</p>
           </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Plan Production">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Finished Good</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newMO.productId}
                onChange={(e) => {
                  const prod = products.find(p => p.id === e.target.value);
                  setNewMO({...newMO, productId: e.target.value, bomId: prod?.bomId || ''});
                }}
                required
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Quantity to Produce" 
              type="number"
              min="1"
              value={newMO.quantity}
              onChange={(e: any) => setNewMO({...newMO, quantity: Number(e.target.value)})}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Create Production Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Manufacturing;
