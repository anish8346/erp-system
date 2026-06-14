import React from 'react';
import { Modal, Input, Button } from '../../components/UI';
import type { Product, BoM, User } from '../../types';

interface ManufacturingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newMO: {
    productId: string;
    quantity: number;
    bomId: string;
    assigneeId: string;
  };
  setNewMO: React.Dispatch<React.SetStateAction<{
    productId: string;
    quantity: number;
    bomId: string;
    assigneeId: string;
  }>>;
  products: Product[];
  boms: BoM[];
  users: User[];
}

const ManufacturingForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  newMO, 
  setNewMO, 
  products, 
  boms, 
  users 
}: ManufacturingFormProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Manufacturing Order">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Finished Good *</label>
            <select 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium"
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
            label="Quantity to Produce *" 
            type="number"
            min="1"
            value={newMO.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMO({...newMO, quantity: Number(e.target.value)})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Bill of Materials *</label>
            <select 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium"
              value={newMO.bomId}
              onChange={(e) => setNewMO({...newMO, bomId: e.target.value})}
              required
            >
              <option value="">Select BoM...</option>
              {boms.filter(b => !newMO.productId || b.productId === newMO.productId).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Assignee</label>
            <select 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium"
              value={newMO.assigneeId}
              onChange={(e) => setNewMO({...newMO, assigneeId: e.target.value})}
            >
              <option value="">Select Assignee...</option>
              {users.filter(u => u.role === 'MFG' || u.role === 'ADMIN').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Draft Order</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManufacturingForm;
