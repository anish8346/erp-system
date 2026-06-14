import React from 'react';
import { ArrowLeft, CheckCircle, Truck, XCircle, Package, User as UserIcon, MapPin, Clock } from 'lucide-react';
import { Button, Card, Badge } from '../../components/UI';
import type { SalesOrder, SalesOrderLine } from '../../types';

interface SalesDetailProps {
  currentOrder: SalesOrder;
  onBack: () => void;
  onConfirm: (id: string) => void;
  onDeliver: (order: SalesOrder) => void;
  onCancel: (id: string) => void;
}

const SalesDetail = ({ 
  currentOrder, 
  onBack, 
  onConfirm, 
  onDeliver, 
  onCancel 
}: SalesDetailProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
        </Button>
        <div className="flex gap-3">
           {currentOrder.status === 'DRAFT' && (
             <>
               <Button variant="danger" onClick={() => onCancel(currentOrder.id)}>
                 <XCircle className="w-4 h-4 mr-2" /> Cancel Order
               </Button>
               <Button onClick={() => onConfirm(currentOrder.id)}>
                 <CheckCircle className="w-4 h-4 mr-2" /> Confirm Order
               </Button>
             </>
           )}
           {(currentOrder.status === 'CONFIRMED' || currentOrder.status === 'PARTIALLY_DELIVERED') && (
             <>
               <Button variant="danger" onClick={() => onCancel(currentOrder.id)}>
                 <XCircle className="w-4 h-4 mr-2" /> Cancel Order
               </Button>
               <Button variant="primary" onClick={() => onDeliver(currentOrder)}>
                 <Truck className="w-4 h-4 mr-2" /> Deliver Items
               </Button>
             </>
           )}
        </div>
      </div>

      <Card title={`Order ${currentOrder.id.slice(0,8).toUpperCase()}`} subtitle={`Status: ${currentOrder.status}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Customer</label>
              <p className="text-lg font-bold text-luxury-brown">{currentOrder.customerName}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Delivery Address
              </label>
              <p className="text-sm font-medium text-luxury-brown">{currentOrder.customerAddress || 'No address provided'}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3" /> Sales Person
              </label>
              <p className="text-sm font-medium text-luxury-brown">{currentOrder.salesPerson?.name || 'Unassigned'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Order Date
              </label>
              <p className="text-sm font-medium text-luxury-brown">{new Date(currentOrder.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Total Amount</label>
              <p className="text-2xl font-black text-luxury-brown">₹{currentOrder.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h4 className="font-bold text-luxury-brown mb-4 border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4" /> Ordered Products
          </h4>
          <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                  <tr className="text-left text-[10px] font-bold text-warm-taupe uppercase tracking-widest border-b">
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-center">Ordered</th>
                    <th className="pb-3 text-center">Delivered</th>
                    <th className="pb-3 text-center">Price</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-center">Availability</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-sm">
                  {currentOrder.orderLines.map(line => {
                    const freeToUse = (line.product?.qtyOnHand || 0) - (line.product?.qtyReserved || 0);
                    const isAvailable = freeToUse >= (line.quantity - line.deliveredQty);
                    return (
                      <tr key={line.id} className="group">
                        <td className="py-4">
                          <p className="font-bold text-luxury-brown">{line.product?.name}</p>
                        </td>
                        <td className="py-4 text-center font-semibold">{line.quantity}</td>
                        <td className="py-4 text-center font-semibold text-blue-600">{line.deliveredQty}</td>
                        <td className="py-4 text-center font-medium text-gray-500">₹{line.price.toLocaleString()}</td>
                        <td className="py-4 text-right font-bold text-luxury-brown">₹{(line.quantity * line.price).toLocaleString()}</td>
                        <td className="py-4 text-center">
                          {isAvailable ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="warning">Shortage: {Math.abs(freeToUse - (line.quantity - line.deliveredQty))}</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
             </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesDetail;
