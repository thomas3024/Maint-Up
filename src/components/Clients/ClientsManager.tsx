import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, Mail, Phone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import ClientForm from './ClientForm';
import { Client } from '../../types';

const ClientsManager: React.FC = () => {
  const { clients, currentUser, deleteClient, getClientProfit } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client: Client) => {
    if (currentUser?.role === 'admin') {
      setEditingClient(client);
      setShowForm(true);
    }
  };

  const handleDelete = (clientId: string) => {
    if (currentUser?.role === 'admin' && window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      deleteClient(clientId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Clients</h1>
          <p className="text-gray-600">{clients.length} client(s) enregistré(s)</p>
        </div>
        
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Client</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const profit = getClientProfit(client.id);
          const profitMargin = client.totalInvoices > 0 ? ((profit / client.totalInvoices) * 100) : 0;
          
          return (
            <div key={client.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pastel-blue rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">
                      Client depuis {client.createdAt.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                {currentUser?.role === 'admin' && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">CA Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {client.totalInvoices.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bénéfice</p>
                    <p className={`text-lg font-semibold ${
                      profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profit.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Marge bénéficiaire</span>
                    <span>{profitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        profitMargin >= 20 ? 'bg-green-500' : 
                        profitMargin >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, profitMargin))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun client trouvé</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Commencez par ajouter votre premier client'}
          </p>
        </div>
      )}

      {/* Client Form Modal */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ClientsManager;