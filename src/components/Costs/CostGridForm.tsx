import React, { useState } from 'react';
import { X, LayoutGrid } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CostGrid } from '../../types';

interface CostGridFormProps {
  onClose: () => void;
}

const CostGridForm: React.FC<CostGridFormProps> = ({ onClose }) => {
  const { addCostGrid } = useAppContext();
  const [form, setForm] = useState<{ name: string; category: string }>({
    name: '',
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data: Omit<CostGrid, 'id'> = { ...form, clients: [] };
    addCostGrid(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Nouvelle Grille</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CostGridForm;
