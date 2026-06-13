
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, ListTree, Settings, Timer } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';

const Boms = () => {
  const [boms, setBoms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newBom, setNewBom] = useState({
    productId: '',
    name: '',
    components: [{ componentId: '', quantity: 1 }],
    operations: [{ name: '', workCenterId: '', duration: 30 }]
  });

  const fetchData = async () => {
    try {
      const [bomsRes, prodRes, wcRes] = await Promise.all([
        api.get('/boms').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/config/work-centers').catch(() => ({ data: [] }))
      ]);
      setBoms(bomsRes.data);
      setProducts(prodRes.data);
      setWorkCenters(wcRes.data);
    } catch (err) {
      console.error("Critical fetch error in BoM page", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addComponent = () => {
    setNewBom({
      ...newBom,
      components: [...newBom.components, { componentId: '', quantity: 1 }]
    });
  };

  const addOperation = () => {
    setNewBom({
      ...newBom,
      operations: [...newBom.operations, { name: '', workCenterId: '', duration: 30 }]
    });
  };

  const removeComponent = (index: number) => {
    const updated = newBom.components.filter((_, i) => i !== index);
    setNewBom({ ...newBom, components: updated });
  };

  const removeOperation = (index: number) => {
    const updated = newBom.operations.filter((_, i) => i !== index);
    setNewBom({ ...newBom, operations: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/boms', newBom);
      setShowForm(false);
      setNewBom({
        productId: '',
        name: '',
        components: [{ componentId: '', quantity: 1 }],
        operations: [{ name: '', workCenterId: '', duration: 30 }]
      });
      fetchData();
    } catch (err) {
      alert("Failed to save Bill of Materials");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">BoM Engineering</h2>
          <p className="text-gray-500">Define product recipes and production steps.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5" /> Create New BoM
        </Button>
      </div>

      {showForm && (
        <Card className="p-8 border-2 border-indigo-100 shadow-xl mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <ListTree className="w-6 h-6 text-indigo-600" /> New Bill of Materials
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">Finished Product</label>
                <select 
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={newBom.productId}
                  onChange={(e) => setNewBom({...newBom, productId: e.target.value})}
                  required
                >
                  <option value="">Select product to manufacture...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <Input 
                label="BoM Version/Name" 
                placeholder="e.g. Standard 2024 Design" 
                value={newBom.name}
                onChange={(e: any) => setNewBom({...newBom, name: e.target.value})}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Material Components</h4>
                <button type="button" onClick={addComponent} className="text-indigo-600 text-xs font-black uppercase hover:underline">+ Add Line</button>
              </div>
              <div className="space-y-3">
                {newBom.components.map((comp, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <select 
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                        value={comp.componentId}
                        onChange={(e) => {
                          const updated = [...newBom.components];
                          updated[idx].componentId = e.target.value;
                          setNewBom({...newBom, components: updated});
                        }}
                        required
                      >
                        <option value="">Select Component</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <Input 
                        type="number" 
                        placeholder="Qty" 
                        value={comp.quantity}
                        onChange={(e: any) => {
                          const updated = [...newBom.components];
                          updated[idx].quantity = Number(e.target.value);
                          setNewBom({...newBom, components: updated});
                        }}
                        required
                      />
                    </div>
                    <button type="button" onClick={() => removeComponent(idx)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Production Operations</h4>
                <button type="button" onClick={addOperation} className="text-indigo-600 text-xs font-black uppercase hover:underline">+ Add Step</button>
              </div>
              <div className="space-y-3">
                {newBom.operations.map((op, idx) => (
                  <div key={idx} className="flex gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex-[2]">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Process Name</label>
                      <input 
                        placeholder="e.g. Surface Sanding" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                        value={op.name}
                        onChange={(e) => {
                          const updated = [...newBom.operations];
                          updated[idx].name = e.target.value;
                          setNewBom({...newBom, operations: updated});
                        }}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Work Center</label>
                      <select 
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                        value={op.workCenterId}
                        onChange={(e) => {
                          const updated = [...newBom.operations];
                          updated[idx].workCenterId = e.target.value;
                          setNewBom({...newBom, operations: updated});
                        }}
                        required
                      >
                        <option value="">Select WC...</option>
                        {workCenters.map(wc => (
                          <option key={wc.id} value={wc.id}>{wc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Mins</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                        value={op.duration}
                        onChange={(e) => {
                          const updated = [...newBom.operations];
                          updated[idx].duration = Number(e.target.value);
                          setNewBom({...newBom, operations: updated});
                        }}
                        required
                      />
                    </div>
                    <button type="button" onClick={() => removeOperation(idx)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Discard</Button>
              <Button type="submit">Finalize & Save BoM</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boms.map((bom) => (
          <Card key={bom.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-indigo-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 leading-tight">{bom.product.name}</h3>
                <p className="text-sm text-gray-500 font-medium">{bom.name}</p>
              </div>
              <Badge variant="neutral">REF-{bom.id.slice(0,5).toUpperCase()}</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Material Requirements</p>
                {bom.bomLines.map((line: any) => (
                  <div key={line.id} className="flex justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="text-gray-700 font-bold">{line.component.name}</span>
                    <span className="font-black text-indigo-600">x{line.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Process Definition</p>
                {bom.operations?.map((op: any) => (
                  <div key={op.id} className="flex items-center gap-3 bg-indigo-50/30 p-3 rounded-xl border border-indigo-50">
                    <div className="p-2 bg-white rounded-lg border border-indigo-100">
                       <Timer className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-indigo-900 leading-tight">{op.name}</p>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase">{op.workCenter?.name || 'Manual'}</p>
                    </div>
                    <span className="text-xs font-black text-indigo-600">{op.duration}m</span>
                  </div>
                ))}
                {(!bom.operations || bom.operations.length === 0) && (
                  <p className="text-xs text-gray-400 italic">No production steps defined.</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Boms;
