import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Cost } from '../../types';

interface CostFormProps {
  cost?: Cost | null;
  onClose: () => void;
}

const CostForm: React.FC<CostFormProps> = ({ cost, onClose }) => {
  const { clients, invoices, addCost, updateCost } = useAppContext();
  const [formData, setFormData] = useState({
    clientId: cost?.clientId || '',
    invoiceId: cost?.invoiceId || '',
    description: cost?.description || '',
    amount: cost?.amount || 0,
    category: cost?.category || 'materials' as 'salaries' | 'charges' | 'subcontracting' | 'materials' | 'transport' | 'housing' | 'other',
    date: cost?.date ? cost.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const clientInvoices = invoices.filter(inv => inv.clientId === formData.clientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) return;

    const costData = {
      ...formData,
      clientName: selectedClient.name,
      date: new Date(formData.date)
    };

    if (cost) {
      updateCost(cost.id, costData);
    } else {
      addCost(costData);
    }
    
    onClose();
  };

  const categories = [
    { id: 'salaries', label: '👥 Salaires', color: 'text-blue-600' },
    { id: 'charges', label: '📊 Charges sociales', color: 'text-purple-600' },
    { id: 'subcontracting', label: '🤝 Sous-traitance', color: 'text-green-600' },
    { id: 'materials', label: '🔧 Matériaux', color: 'text-orange-600' },
    { id: 'transport', label: '🚛 Transport', color: 'text-yellow-600' },
    { id: 'housing', label: '🏠 Logements', color: 'text-teal-600' },
    { id: 'other', label: '📋 Autre', color: 'text-gray-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pastel-coral rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {cost ? 'Modifier le Coût' : 'Nouveau Coût'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value, invoiceId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          {formData.clientId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facture associée (optionnel)
              </label>
              <select
                value={formData.invoiceId}
                onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Aucune facture associée</option>
                {clientInvoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.number} - {invoice.description} ({invoice.amountHT.toLocaleString('fr-FR')} € HT)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: Salaire technicien, Pièces de rechange..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {cost ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CostForm;