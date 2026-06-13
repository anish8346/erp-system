
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, CheckCircle, Clock, ShoppingBag, Truck, AlertTriangle, Package, ChevronRight, Search } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Sales Orders</h2>
          <p className="text-warm-taupe text-sm font-medium">Track customer orders and monitor fulfillment status.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="font-semibold">
          <Plus className="w-5 h-5" /> New Sales Order
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-soft-cream">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
          <input 
            placeholder="Search by customer or order ID..." 
            className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-brown/20 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((o) => {
          const isDelayed = o.status === 'CONFIRMED' && (new Date().getTime() - new Date(o.createdAt).getTime() > 2 * 24 * 60 * 60 * 1000);
          return (
          <Card key={o.id} className={`hover:shadow-md transition-all border-l-4 ${isDelayed ? 'border-l-rose-500' : 'border-l-luxury-brown'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 
                  o.status === 'PARTIALLY_DELIVERED' ? 'bg-amber-50 text-amber-600' : 
                  o.status === 'CONFIRMED' ? 'bg-indigo-50 text-indigo-600' : 
                  'bg-faded-white text-warm-taupe/60'
                }`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-luxury-brown text-lg">{o.customerName}</h3>
                    <Badge variant={
                      o.status === 'DELIVERED' ? 'success' : 
                      o.status === 'PARTIALLY_DELIVERED' ? 'warning' : 
                      o.status === 'CONFIRMED' ? 'purple' : 
                      'neutral'
                    }>
                      {o.status.replace('_', ' ')}
                    </Badge>
                    {isDelayed && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        <AlertTriangle className="w-3 h-3" /> Delayed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-warm-taupe font-medium">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] text-gray-600">ORD-{o.id.slice(0,8).toUpperCase()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3">
                <p className="text-2xl font-bold text-luxury-brown">₹{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                {o.status === 'DRAFT' ? (
                  <Button size="sm" onClick={() => handleConfirm(o.id)} className="font-bold">
                    <CheckCircle className="w-4 h-4" /> Confirm Order
                  </Button>
                ) : (o.status === 'CONFIRMED' || o.status === 'PARTIALLY_DELIVERED') ? (
                  <Button size="sm" variant="primary" onClick={() => openDeliverModal(o)} className="font-bold">
                    <Truck className="w-4 h-4" /> Deliver Items
                  </Button>
                ) : (
                   <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                     <CheckCircle className="w-3.5 h-3.5" /> Fully Delivered
                   </span>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-soft-cream grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {o.orderLines.map((line: any) => (
                 <div key={line.id} className="bg-faded-white/50 p-3 rounded-xl flex flex-col gap-2 border border-soft-cream">
                    <div className="flex justify-between items-start gap-2">
                       <span className="text-xs font-bold text-gray-700 leading-tight">{line.product.name}</span>
                       <span className="text-[11px] font-bold text-luxury-brown whitespace-nowrap">{line.deliveredQty || 0} / {line.quantity}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-500 ${
                           line.deliveredQty === line.quantity ? 'bg-emerald-500' : 'bg-luxury-brown'
                         }`}
                         style={{ width: `${((line.deliveredQty || 0) / line.quantity) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        )})}
        {filteredOrders.length === 0 && (
           <div className="text-center py-20 bg-faded-white rounded-2xl border-2 border-dashed border-soft-cream">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-warm-taupe font-bold text-lg">No sales orders found</p>
              <p className="text-warm-taupe/60 text-sm mt-1">Start by creating a new order for your customers.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Select Product</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
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
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Order</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeliverModal} onClose={() => setShowDeliverModal(false)} title="Process Delivery">
        <form onSubmit={handleDeliverSubmit} className="space-y-6">
          <p className="text-sm text-warm-taupe font-medium italic">Enter quantities for this partial or full shipment:</p>
          <div className="space-y-3">
            {selectedOrder?.orderLines.map((line: any) => (
              <div key={line.id} className="flex items-center justify-between p-4 bg-faded-white rounded-xl border border-soft-cream">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-soft-cream shadow-sm">
                    <Package className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{line.product.name}</p>
                    <p className="text-[10px] text-warm-taupe/60 font-bold uppercase mt-0.5">Remaining to ship: {line.quantity - (line.deliveredQty || 0)}</p>
                  </div>
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    min="0"
                    max={line.quantity - (line.deliveredQty || 0)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white text-center font-bold"
                    value={deliverQtys[line.id] || 0}
                    onChange={(e: any) => setDeliverQtys({...deliverQtys, [line.id]: e.target.value})}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowDeliverModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Shipment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
