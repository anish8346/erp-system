import React, { useState } from 'react';
import { Modal, Button, Badge } from '../../components/UI';
import { Search, UserCircle2, Check } from 'lucide-react';
import type { User } from '../../types';

interface UserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
  users: User[];
}

const UserSelectModal = ({ isOpen, onClose, onSelect, users }: UserSelectModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Sales Person">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            placeholder="Search team members..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-luxury-brown outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 custom-scrollbar">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => { onSelect(user); onClose(); }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-luxury-brown/10 group-hover:text-luxury-brown">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={user.role === 'SALES' ? 'purple' : 'neutral'}>{user.role}</Badge>
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-luxury-brown group-hover:bg-luxury-brown/5">
                  <Check className="w-3 h-3 text-transparent group-hover:text-luxury-brown" />
                </div>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm italic">
              No matching team members found.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserSelectModal;
