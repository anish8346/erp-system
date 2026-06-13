
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Download, Truck, ShoppingCart, Package } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';

interface PurchaseOrder {
  id: string;
  vendorName: string;
  status: string;
  totalAmount: number;
  orderLines: any[];
}

const Purchase = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [receiveQtys, setReceiveQtys] = useState<any>({});

  const [newOrder, setNewOrder] = useState({
    vendorId: '',
    productId: '',
    quantity: 1,
  });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, vendorsRes] = await Promise.all([
        api.get('/purchase'),
        api.get('/products'),
        api.get('/vendors'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setVendors(vendorsRes.data);
    } catch (err) {
      console.error("Fetch data failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = products.find(p => p.id === newOrder.productId);
      const vendor = vendors.find(v => v.id === newOrder.vendorId);
      
      await api.post('/purchase', {
        vendorId: newOrder.vendorId,
        vendorName: vendor?.name || 'Unknown',
        orderLines: [{
          productId: newOrder.productId,
          quantity: newOrder.quantity,
          price: product.costPrice,
        }]
      });
      setShowForm(false);
      setNewOrder({ vendorId: '', productId: '', quantity: 1 });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create procurement order");
    }
  };

  const openReceiveModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    const initialQtys: any = {};
    order.orderLines.forEach(line => {
      initialQtys[line.id] = line.quantity - (line.receivedQty || 0);
    });
    setReceiveQtys(initialQtys);
    setShowReceiveModal(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const items = Object.keys(receiveQtys).map(lineId => ({
      lineId,
      quantity: Number(receiveQtys[lineId])
    })).filter(i => i.quantity > 0);

    try {
      await api.post(`/purchase/${selectedOrder.id}/receive`, { items });
      setShowReceiveModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Receipt failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Procurement Orders</h2>
          <p className="text-gray-500">Manage vendor purchases and stock replenishment.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5" /> New Procurement
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((o) => (
          <Card key={o.id} className="hover:border-amber-200 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${o.status === 'RECEIVED' ? 'bg-green-50 text-green-600' : o.status === 'PARTIALLY_RECEIVED' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 text-lg">{o.vendorName}</h3>
                    <Badge variant={o.status === 'RECEIVED' ? 'success' : o.status === 'PARTIALLY_RECEIVED' ? 'warning' : 'neutral'}>
                      {o.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded inline-block">
                    PO-{o.id.slice(0,8)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <p className="text-2xl font-black text-gray-900">₹{o.totalAmount.toFixed(2)}</p>
                {o.status !== 'RECEIVED' && (
                  <Button size="sm" variant="secondary" onClick={() => openReceiveModal(o)}>
                    <Download className="w-4 h-4" /> Receive Items
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4 overflow-x-auto pb-2">
               {o.orderLines.map((line: any) => (
                 <div key={line.id} className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col gap-1 border border-gray-100 min-w-[140px]">
                    <span className="text-xs font-bold text-gray-800 truncate">{line.product.name}</span>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Received</span>
                       <span className="text-xs font-black text-blue-600">{line.receivedQty || 0} / {line.quantity}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1 rounded-full mt-1">
                       <div 
                         className="bg-blue-500 h-1 rounded-full" 
                         style={{ width: `${((line.receivedQty || 0) / line.quantity) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        ))}
        {orders.length === 0 && (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No procurement orders yet.</p>
           </div>
        )}
      </div>

      {/* Create PO Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Procurement Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Vendor</label>
            <select 
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={newOrder.vendorId}
              onChange={(e) => setNewOrder({...newOrder, vendorId: e.target.value})}
              required
            >
              <option value="">Select a vendor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Product</label>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newOrder.productId}
                onChange={(e) => setNewOrder({...newOrder, productId: e.target.value})}
                required
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.costPrice})</option>
                ))}
              </select>
            </div>
            <Input 
              label="Quantity" 
              type="number"
              min="1"
              value={newOrder.quantity}
              onChange={(e: any) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Create Order</Button>
          </div>
        </form>
      </Modal>

      {/* Receive Items Modal */}
      <Modal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} title="Receive Products">
        <form onSubmit={handleReceiveSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4 font-medium italic">Enter the quantities physically received today:</p>
          {selectedOrder?.orderLines.map((line: any) => (
            <div key={line.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                   <Package className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{line.product.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Pending: {line.quantity - (line.receivedQty || 0)}</p>
                </div>
              </div>
              <div className="w-32">
                 <Input 
                   type="number" 
                   min="0"
                   max={line.quantity - (line.receivedQty || 0)}
                   value={receiveQtys[line.id] || 0}
                   onChange={(e: any) => setReceiveQtys({...receiveQtys, [line.id]: e.target.value})}
                 />
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowReceiveModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Receipt</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchase;
