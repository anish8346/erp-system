import React from 'react';
import { Modal, Button } from '../../components/UI';
import { Package } from 'lucide-react';
import type { SalesOrder, SalesOrderLine } from '../../types';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedOrder: SalesOrder | null;
  deliverQtys: Record<string, number>;
  setDeliverQtys: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const DeliveryModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  selectedOrder, 
  deliverQtys, 
  setDeliverQtys 
}: DeliveryModalProps) => {
  if (!selectedOrder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Delivery">
      <form onSubmit={onSubmit} className="space-y-6">
        <p className="text-sm text-warm-taupe font-medium italic">Enter quantities for this partial or full shipment:</p>
        <div className="space-y-3">
          {selectedOrder.orderLines.map((line: SalesOrderLine) => (
            <div key={line.id} className="flex items-center justify-between p-4 bg-faded-white rounded-xl border border-soft-cream">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-soft-cream shadow-sm">
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-tight">{line.product?.name}</p>
                  <p className="text-[10px] text-warm-taupe/60 font-bold uppercase mt-0.5">Remaining: {line.quantity - (line.deliveredQty || 0)}</p>
                </div>
              </div>
              <div className="w-24">
                <input 
                  type="number" 
                  min="0"
                  max={line.quantity - (line.deliveredQty || 0)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white text-center font-bold"
                  value={deliverQtys[line.id] || 0}
                  onChange={(e) => setDeliverQtys({...deliverQtys, [line.id]: Number(e.target.value)})}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Confirm Shipment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeliveryModal;
