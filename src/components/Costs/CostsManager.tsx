import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, DollarSign, Users, FileText, Truck, Wrench, BarChart3, Home, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import CostForm from './CostForm';
import { Cost } from '../../types';

const CostsManager: React.FC = () => {
  const { costs, invoices, clients, currentUser, deleteCost } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [openClients, setOpenClients] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'salaries', label: '👥 Salaires', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'charges', label: '📊 Charges sociales', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'subcontracting', label: '🤝 Sous-traitance', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'materials', label: '🔧 Matériaux', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'office', label: '🏢 Bureau', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'transport', label: '🚛 Transport', icon: Truck, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'housing', label: '🏠 Logements', icon: Home, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'other', label: '📋 Autre', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));

  const filteredCosts = clientFilter
    ? costs.filter(cost => {
        const matchesSearch =
          cost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cost.clientName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || cost.category === categoryFilter;
        const matchesClient = clientFilter === 'all' || cost.clientId === clientFilter;

        return matchesSearch && matchesCategory && matchesClient;
      })
    : [];


  const handleEdit = (cost: Cost) => {
    if (currentUser?.role === 'admin') {
      setEditingCost(cost);
      setShowForm(true);
    }
  };

  const handleDelete = (costId: string) => {
    if (currentUser?.role === 'admin' && window.confirm('Êtes-vous sûr de vouloir supprimer ce coût ?')) {
      deleteCost(costId);
    }
  };

  const toggleClient = (clientId: string) => {
    setOpenClients(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  };

  const getInvoiceInfo = (invoiceId?: string) => {
    if (!invoiceId) return null;
    return invoices.find(inv => inv.id === invoiceId);
  };

  const totalAmount = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);

  const costsByClient = filteredCosts.reduce<Record<string, { clientId: string; clientName: string; costs: Cost[] }>>((acc, cost) => {
    if (!acc[cost.clientId]) {
      acc[cost.clientId] = { clientId: cost.clientId, clientName: cost.clientName, costs: [] };
    }
    acc[cost.clientId].costs.push(cost);
    return acc;
  }, {});

  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2025, i, 1), 'MMM yyyy')
  );

  const monthlyCosts = clientFilter
    ? sortedClients.map(client => {
        const clientCosts = filteredCosts.filter(c => c.clientId === client.id);
        const totals = months.map(month =>
          clientCosts
            .filter(c => format(c.date, 'MMM yyyy') === month)
            .reduce((sum, c) => sum + c.amount, 0)
        );
        return { client, totals };
      })
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🟦 Gestion des Coûts</h1>
          <p className="text-gray-600">
            {filteredCosts.length} coût(s) • {totalAmount.toLocaleString('fr-FR')} € total
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Sélectionner un client</option>
            <option value="all">Tous les clients</option>
            {sortedClients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Coût</span>
            </button>
          )}
        </div>
      </div>

      {clientFilter === '' ? (
        <div className="text-center py-12 text-gray-500">
          Sélectionnez un client pour afficher les coûts
        </div>
      ) : (
        <>
          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {categories.map((category) => {
              const categoryTotal = costs
                .filter(cost => cost.category === category.id)
                .reduce((sum, cost) => sum + cost.amount, 0);

              const Icon = category.icon;

              return (
                <div key={category.id} className={`${category.bg} p-4 rounded-lg border border-opacity-20`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`h-5 w-5 ${category.color}`} />
                    <span className="text-sm font-medium text-gray-700">{category.label}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {categoryTotal.toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-gray-600">
                    {costs.filter(cost => cost.category === category.id).length} coût(s)
                  </p>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un coût..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>

          </div>

          {/* Costs List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facture associée
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {currentUser?.role === 'admin' && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.values(costsByClient).map(group => (
                    <React.Fragment key={group.clientId}>
                      <tr
                        className="bg-gray-100 cursor-pointer"
                        onClick={() => toggleClient(group.clientId)}
                      >
                        <td
                          colSpan={currentUser?.role === 'admin' ? 7 : 6}
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-700 flex items-center gap-2"
                        >
                          {openClients[group.clientId] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span>{group.clientName}</span>
                        </td>
                      </tr>
                      {openClients[group.clientId] &&
                        group.costs.map(cost => {
                        const categoryInfo = getCategoryInfo(cost.category);
                        const Icon = categoryInfo.icon;
                        const invoiceInfo = getInvoiceInfo(cost.invoiceId);
                        return (
                          <tr key={cost.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{cost.description}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {cost.clientName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {invoiceInfo ? (
                                <div>
                                  <div className="font-medium">{invoiceInfo.number}</div>
                                  <div className="text-xs text-gray-500">{invoiceInfo.amountHT.toLocaleString('fr-FR')} € HT</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Non associé</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Icon className={`h-4 w-4 ${categoryInfo.color}`} />
                                <span className="text-sm text-gray-900">{categoryInfo.label}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-red-600">
                                {cost.amount.toLocaleString('fr-FR')} €
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {cost.date.toLocaleDateString('fr-FR')}
                            </td>
                            {currentUser?.role === 'admin' && (
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEdit(cost)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDelete(cost.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Costs Grid */}
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto mt-8">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  {months.map(month => (
                    <th
                      key={month}
                      className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlyCosts.map(row => (
                  <tr key={row.client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {row.client.name}
                    </td>
                    {row.totals.map((total, idx) => (
                      <td key={idx} className="px-4 py-2 text-sm text-blue-600 font-semibold">
                        {total > 0 ? `${total.toLocaleString('fr-FR')} €` : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCosts.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun coût trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || categoryFilter !== 'all' || (clientFilter !== '' && clientFilter !== 'all') ?
                  'Essayez avec d\'autres critères de recherche' :
                  'Commencez par ajouter votre premier coût'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Cost Form Modal */}
      {showForm && (
        <CostForm
          cost={editingCost}
          defaultClientId={clientFilter !== 'all' ? clientFilter : undefined}
          onClose={() => {
            setShowForm(false);
            setEditingCost(null);
          }}
        />
      )}
    </div>
  );
};

export default CostsManager;
