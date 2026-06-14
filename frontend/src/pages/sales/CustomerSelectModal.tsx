import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../../components/UI';
import { Search, User, MapPin, Phone, Check, Plus } from 'lucide-react';
import type { Customer } from '../../types';
import api from '../../services/api';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

const CustomerSelectModal = ({ isOpen, onClose, onSelect }: CustomerSelectModalProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { limit: 100, searchTerm } });
      setCustomers(res.data.customers);
    } catch (err) {
      console.error("Failed to fetch customers for selection", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchCustomers();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Customer">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            placeholder="Search customers by name or mobile..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-luxury-brown outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 custom-scrollbar">
          {loading ? (
             <div className="p-10 text-center text-gray-400 text-sm">Searching...</div>
          ) : customers.map(customer => (
            <button
              key={customer.id}
              onClick={() => { onSelect(customer); onClose(); }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-luxury-brown/10 group-hover:text-luxury-brown">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                     <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {customer.mobile || 'No mobile'}
                     </p>
                     <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1 max-w-[150px] truncate">
                        <MapPin className="w-2.5 h-2.5" /> {customer.address || 'No address'}
                     </p>
                  </div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-luxury-brown group-hover:bg-luxury-brown/5">
                <Check className="w-3 h-3 text-transparent group-hover:text-luxury-brown" />
              </div>
            </button>
          ))}
          {customers.length === 0 && !loading && (
            <div className="p-10 text-center">
                <p className="text-gray-400 text-sm italic mb-2">No matching customers found.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerSelectModal;
