import React, { useState } from 'react';
import { Plus, Search, Receipt, Clock, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import InvoiceForm from './InvoiceForm';
import { Invoice } from '../../types';

const InvoicesManager: React.FC = () => {
  const { invoices, currentUser, updateInvoice, deleteInvoice } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (invoiceId: string, newStatus: 'pending' | 'paid' | 'overdue') => {
    if (currentUser?.role === 'admin') {
      updateInvoice(invoiceId, { status: newStatus });
    }
  };

  const handleEdit = (invoice: Invoice) => {
    if (currentUser?.role === 'admin') {
      setEditingInvoice(invoice);
      setShowForm(true);
    }
  };

  const handleDelete = (invoiceId: string) => {
    if (currentUser?.role === 'admin' && window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      deleteInvoice(invoiceId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-pastel-green text-green-800';
      case 'pending': return 'bg-pastel-coral text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const totalAmountHT = filteredInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
  const totalTVA = filteredInvoices.reduce((sum, inv) => sum + inv.tva, 0);
  const totalTTC = filteredInvoices.reduce((sum, inv) => sum + inv.amountTTC, 0);
  const paidAmountHT = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amountHT, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Factures</h1>
          <div className="text-gray-600 space-y-1">
            <p>{filteredInvoices.length} facture(s)</p>
            <p>Total HT: {totalAmountHT.toLocaleString('fr-FR')} € • TVA: {totalTVA.toLocaleString('fr-FR')} € • TTC: {totalTTC.toLocaleString('fr-FR')} €</p>
            <p>Payé: {paidAmountHT.toLocaleString('fr-FR')} € HT</p>
          </div>
        </div>
        
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Facture</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-pastel-coral p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-1">En Attente</h3>
          <p className="text-2xl font-bold text-red-900">
            {invoices.filter(inv => inv.status === 'pending').length}
          </p>
          <p className="text-sm text-red-700">
            {invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amountHT, 0).toLocaleString('fr-FR')} € HT
          </p>
        </div>
        
        <div className="bg-pastel-green p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-1">Payées</h3>
          <p className="text-2xl font-bold text-green-900">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
          <p className="text-sm text-green-700">
            {invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amountHT, 0).toLocaleString('fr-FR')} € HT
          </p>
        </div>
        
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-1">En Retard</h3>
          <p className="text-2xl font-bold text-red-900">
            {invoices.filter(inv => inv.status === 'overdue').length}
          </p>
          <p className="text-sm text-red-700">
            {invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amountHT, 0).toLocaleString('fr-FR')} € HT
          </p>
        </div>
        
        <div className="bg-pastel-blue p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Total TVA</h3>
          <p className="text-2xl font-bold text-blue-900">
            {totalTVA.toLocaleString('fr-FR')} €
          </p>
          <p className="text-sm text-blue-700">
            À déclarer
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Payées</option>
          <option value="overdue">En retard</option>
        </select>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant HT
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TVA
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total TTC
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={invoice.description}>
                        {invoice.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.clientName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {invoice.amountHT.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {invoice.tva.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {invoice.amountTTC.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {currentUser?.role === 'admin' ? (
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as any)}
                        className={`text-xs font-medium px-3 py-1 rounded-full border-0 ${getStatusColor(invoice.status)}`}
                      >
                        <option value="pending">En attente</option>
                        <option value="paid">Payée</option>
                        <option value="overdue">En retard</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span>{getStatusLabel(invoice.status)}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.dueDate.toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {invoice.pdfUrl && (
                        <button
                          onClick={() => window.open(invoice.pdfUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Voir le PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {currentUser?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune facture trouvée</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' ? 'Essayez avec d\'autres critères de recherche' : 'Commencez par créer votre première facture'}
          </p>
        </div>
      )}

      {/* Invoice Form Modal */}
      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onClose={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default InvoicesManager;