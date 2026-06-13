
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, CheckCircle, Clock, ShoppingBag, Truck, AlertTriangle, Package } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';

interface SalesOrder {
  id: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderLines: any[];
}

const Sales = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [deliverQtys, setDeliverQtys] = useState<any>({});

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    productId: '',
    quantity: 1,
  });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Fetch sales data failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = products.find(p => p.id === newOrder.productId);
      await api.post('/sales', {
        customerName: newOrder.customerName,
        orderLines: [{
          productId: newOrder.productId,
          quantity: newOrder.quantity,
          price: product.salesPrice,
        }]
      });
      setShowModal(false);
      setNewOrder({ customerName: '', productId: '', quantity: 1 });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create sales order");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/sales/${id}/confirm`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Confirmation failed. Check logs for shortages.");
    }
  };

  const openDeliverModal = (order: SalesOrder) => {
    setSelectedOrder(order);
    const initialQtys: any = {};
    order.orderLines.forEach(line => {
      initialQtys[line.id] = line.quantity - (line.deliveredQty || 0);
    });
    setDeliverQtys(initialQtys);
    setShowDeliverModal(true);
  };

  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const items = Object.keys(deliverQtys).map(lineId => ({
      lineId,
      quantity: Number(deliverQtys[lineId])
    })).filter(i => i.quantity > 0);

    try {
      await api.post(`/sales/${selectedOrder.id}/deliver`, { items });
      setShowDeliverModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Delivery failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sales Management</h2>
          <p className="text-gray-500">Track customer orders and monitor fulfillment status.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" /> New Sales Order
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((o) => {
          const isDelayed = o.status === 'CONFIRMED' && (new Date().getTime() - new Date(o.createdAt).getTime() > 2 * 24 * 60 * 60 * 1000);
          return (
          <Card key={o.id} className={`hover:border-blue-200 transition-all ${isDelayed ? 'border-red-200 bg-red-50/10' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${o.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : o.status === 'PARTIALLY_DELIVERED' ? 'bg-amber-50 text-amber-600' : o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 text-lg">{o.customerName}</h3>
                    <Badge variant={o.status === 'DELIVERED' ? 'success' : o.status === 'PARTIALLY_DELIVERED' ? 'warning' : o.status === 'CONFIRMED' ? 'primary' : 'neutral'}>
                      {o.status.replace('_', ' ')}
                    </Badge>
                    {isDelayed && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Delayed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-1.5 rounded uppercase text-[10px]">{o.id.slice(0,8)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <p className="text-2xl font-black text-gray-900">₹{o.totalAmount.toFixed(2)}</p>
                {o.status === 'DRAFT' ? (
                  <Button size="sm" onClick={() => handleConfirm(o.id)}>
                    <CheckCircle className="w-4 h-4" /> Confirm Order
                  </Button>
                ) : (o.status === 'CONFIRMED' || o.status === 'PARTIALLY_DELIVERED') ? (
                  <Button size="sm" variant="primary" onClick={() => openDeliverModal(o)}>
                    <Truck className="w-4 h-4" /> Deliver Items
                  </Button>
                ) : (
                   <span className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
                     <CheckCircle className="w-4 h-4" /> Order Fulfilled
                   </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4 overflow-x-auto pb-2">
               {o.orderLines.map((line: any) => (
                 <div key={line.id} className="bg-gray-50 px-3 py-2 rounded-lg flex flex-col gap-1 border border-gray-100 min-w-[140px]">
                    <span className="text-xs font-bold text-gray-800 truncate">{line.product.name}</span>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Delivered</span>
                       <span className="text-xs font-black text-blue-600">{line.deliveredQty || 0} / {line.quantity}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1 rounded-full mt-1">
                       <div 
                         className="bg-blue-500 h-1 rounded-full" 
                         style={{ width: `${((line.deliveredQty || 0) / line.quantity) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        )})}
        {orders.length === 0 && (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No sales orders found. Create your first one!</p>
           </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Sales Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Customer Name" 
            placeholder="e.g. Acme Corp"
            value={newOrder.customerName}
            onChange={(e: any) => setNewOrder({...newOrder, customerName: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Select Product</label>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newOrder.productId}
                onChange={(e) => setNewOrder({...newOrder, productId: e.target.value})}
                required
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.salesPrice})</option>
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
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Sales Order</Button>
          </div>
        </form>
      </Modal>

      {/* Deliver Items Modal */}
      <Modal isOpen={showDeliverModal} onClose={() => setShowDeliverModal(false)} title="Process Delivery">
        <form onSubmit={handleDeliverSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4 font-medium italic">Select quantities to ship to customer:</p>
          {selectedOrder?.orderLines.map((line: any) => (
            <div key={line.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                   <Package className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{line.product.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">To Ship: {line.quantity - (line.deliveredQty || 0)}</p>
                </div>
              </div>
              <div className="w-32">
                 <Input 
                   type="number" 
                   min="0"
                   max={line.quantity - (line.deliveredQty || 0)}
                   value={deliverQtys[line.id] || 0}
                   onChange={(e: any) => setDeliverQtys({...deliverQtys, [line.id]: e.target.value})}
                 />
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowDeliverModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Dispatch Items</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
