import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import StatsCard from './StatsCard';
import RevenueChart from './RevenueChart';
import ProfitChart from './ProfitChart';
import ClientsList from './ClientsList';
import { useAppContext } from '../../context/AppContext';

const Dashboard: React.FC = () => {
  const { 
    clients, 
    invoices, 
    getTotalRevenue, 
    getTotalCosts, 
    getTotalProfit 
  } = useAppContext();

  const totalRevenue = getTotalRevenue();
  const totalCosts = getTotalCosts();
  const totalProfit = getTotalProfit();
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amountTTC, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tableau de Bord</h1>
        <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Chiffre d'Affaires"
          value={`${totalRevenue.toLocaleString('fr-FR')} €`}
          change="+12% ce mois"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        
        <StatsCard
          title="Coûts Totaux"
          value={`${totalCosts.toLocaleString('fr-FR')} €`}
          change="+5% ce mois"
          changeType="negative"
          icon={DollarSign}
          color="blue"
        />
        
        <StatsCard
          title="Bénéfices"
          value={`${totalProfit.toLocaleString('fr-FR')} €`}
          change={`${profitMargin.toFixed(1)}% marge`}
          changeType="positive"
          icon={ArrowUpRight}
          color="green"
        />
        
        <StatsCard
          title="Factures en Attente"
          value={`${pendingAmount.toLocaleString('fr-FR')} €`}
          change={`${pendingInvoices.length} facture(s)`}
          changeType="neutral"
          icon={Receipt}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Évolution du Chiffre d'Affaires
          </h2>
          <RevenueChart />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Analyse des Bénéfices
          </h2>
          <ProfitChart />
        </div>
      </div>

      {/* Clients Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Aperçu des Clients
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>{clients.length} client(s) actif(s)</span>
          </div>
        </div>
        <ClientsList />
      </div>
    </div>
  );
};

export default Dashboard;