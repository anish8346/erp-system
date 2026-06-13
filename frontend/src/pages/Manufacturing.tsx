
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Factory, PlayCircle, CheckCircle2, ChevronRight, Activity, Clock, Box } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';

interface ManufacturingOrder {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  status: string;
  bom: any;
  WorkOrders: any[];
}

const Manufacturing = () => {
  const [mos, setMos] = useState<ManufacturingOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
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
    } catch (err) {
      alert("Failed to create manufacturing order");
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
    } catch (err) {
      alert("Failed to update work order status");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Shop Floor Control</h2>
          <p className="text-gray-500">Manage production orders and step-by-step assembly.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5" /> Plan Production
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mos.map((mo) => {
          const allStepsDone = mo.WorkOrders?.length > 0 && mo.WorkOrders.every((wo: any) => wo.status === 'DONE');
          const isDone = mo.status === 'DONE';

          return (
            <Card key={mo.id} className={`overflow-hidden transition-all ${isDone ? 'opacity-75 border-gray-100' : 'hover:border-indigo-200'}`}>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${isDone ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Factory className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-gray-900 text-lg">{mo.product.name}</h3>
                        <Badge variant={isDone ? 'success' : mo.status === 'DRAFT' ? 'neutral' : 'primary'}>
                          {mo.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-1.5 rounded uppercase text-[10px]">MO-{mo.id.slice(0,8)}</span>
                        <span className="flex items-center gap-1 font-bold text-indigo-600"><Box className="w-3 h-3" /> Qty: {mo.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    {mo.status !== 'DONE' && (
                      <Button 
                        disabled={!allStepsDone && mo.WorkOrders?.length > 0} 
                        onClick={() => handleProduce(mo.id)}
                        className={allStepsDone ? 'animate-pulse shadow-lg shadow-green-200' : ''}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Finalize Production
                      </Button>
                    )}
                    {!allStepsDone && mo.WorkOrders?.length > 0 && mo.status !== 'DONE' && (
                       <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Complete all steps first</p>
                    )}
                  </div>
                </div>

                {/* Work Orders / Steps Flow */}
                {mo.WorkOrders?.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mo.WorkOrders.map((wo: any, idx: number) => (
                      <div key={wo.id} className={`relative p-4 rounded-2xl border transition-all ${
                        wo.status === 'DONE' ? 'bg-green-50 border-green-100' : 
                        wo.status === 'IN_PROGRESS' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 
                        'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Step {idx + 1}</span>
                           {wo.status === 'DONE' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-300" />}
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{wo.operation.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium uppercase mb-4">{wo.operation.workCenter?.name || 'Assembly'}</p>
                        
                        <div className="flex gap-2">
                          {wo.status === 'PENDING' && (
                            <button 
                              onClick={() => updateWOStatus(wo.id, 'IN_PROGRESS')}
                              className="w-full py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-black hover:bg-indigo-50 transition-colors"
                            >
                              START
                            </button>
                          )}
                          {wo.status === 'IN_PROGRESS' && (
                            <button 
                              onClick={() => updateWOStatus(wo.id, 'DONE')}
                              className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 transition-colors"
                            >
                              FINISH
                            </button>
                          )}
                          {wo.status === 'DONE' && (
                             <span className="w-full py-1.5 text-center text-green-600 text-[10px] font-black uppercase tracking-widest">Completed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {(!mo.WorkOrders || mo.WorkOrders.length === 0) && mo.status !== 'DONE' && (
                   <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                      <Activity className="w-5 h-5 text-amber-500" />
                      <p className="text-xs font-medium text-amber-700">No work steps defined for this product's BoM. You can finalize directly.</p>
                   </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Manufacturing Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Finished Good</label>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
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
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Create MO</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Internal Plus Icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default Manufacturing;
