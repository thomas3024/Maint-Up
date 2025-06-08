import React from 'react';
import { Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ClientsList: React.FC = () => {
  const { clients, getClientProfit } = useAppContext();

  const clientsWithProfit = clients.map(client => ({
    ...client,
    profit: getClientProfit(client.id),
    profitMargin: client.totalInvoices > 0 ? ((getClientProfit(client.id) / client.totalInvoices) * 100) : 0
  })).sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-4">
      {clientsWithProfit.map((client) => (
        <div
          key={client.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">CA Total</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {client.totalInvoices.toLocaleString('fr-FR')} €
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Bénéfice</p>
              <div className="flex items-center space-x-1">
                {client.profit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <p className={`font-semibold ${
                  client.profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {client.profit.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Marge</p>
              <p className={`font-semibold ${
                client.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {client.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientsList;