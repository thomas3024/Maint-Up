import React, { useState } from 'react';
import { Building2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ClientAnalytics: React.FC = () => {
  const { clients, getClientMonthlyData } = useAppContext();
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const monthlyData = selectedClient ? getClientMonthlyData(selectedClientId) : [];

  const chartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Revenus HT',
        data: monthlyData.map(d => d.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Coûts',
        data: monthlyData.map(d => d.costs),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Bénéfices',
        data: monthlyData.map(d => d.profit),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const marginData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Marge bénéficiaire (%)',
        data: monthlyData.map(d => d.margin),
        backgroundColor: monthlyData.map(d => 
          d.margin >= 20 ? 'rgba(16, 185, 129, 0.8)' : 
          d.margin >= 10 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: monthlyData.map(d => 
          d.margin >= 20 ? '#10B981' : 
          d.margin >= 10 ? '#F59E0B' : '#EF4444'
        ),
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return value.toLocaleString('fr-FR') + (this.chart.data.datasets[0].label?.includes('%') ? '%' : ' €');
          }
        }
      }
    }
  };

  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalCosts = monthlyData.reduce((sum, d) => sum + d.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Analytics par Client</h1>
          <p className="text-gray-600">Analyse détaillée de la performance client</p>
        </div>
        
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <>
          {/* Client Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-pastel-blue rounded-lg">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                <p className="text-gray-600">{selectedClient.email}</p>
                <p className="text-sm text-gray-500">
                  Client depuis {selectedClient.createdAt.toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-pastel-green p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 opacity-70">Revenus Totaux</p>
                    <p className="text-xl font-bold text-green-900 mt-1">
                      {totalRevenue.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>

              <div className="bg-pastel-blue p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 opacity-70">Coûts Totaux</p>
                    <p className="text-xl font-bold text-blue-900 mt-1">
                      {totalCosts.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <div className="bg-pastel-purple p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800 opacity-70">Bénéfice Net</p>
                    <p className={`text-xl font-bold mt-1 ${
                      totalProfit >= 0 ? 'text-purple-900' : 'text-red-600'
                    }`}>
                      {totalProfit.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  {totalProfit >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              <div className="bg-pastel-coral p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800 opacity-70">Marge Moyenne</p>
                    <p className={`text-xl font-bold mt-1 ${
                      averageMargin >= 20 ? 'text-green-600' : 
                      averageMargin >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {averageMargin.toFixed(1)}%
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Évolution Mensuelle
              </h3>
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Marges Bénéficiaires
              </h3>
              <div className="h-80">
                <Bar data={marginData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Monthly Details */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Détail Mensuel</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mois
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus HT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coûts
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bénéfice
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marge
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factures
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{data.month}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-green-600">
                          {data.revenue.toLocaleString('fr-FR')} €
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-blue-600">
                          {data.costs.toLocaleString('fr-FR')} €
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${
                          data.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.profit.toLocaleString('fr-FR')} €
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${
                          data.margin >= 20 ? 'text-green-600' : 
                          data.margin >= 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {data.margin.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{data.invoicesCount}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientAnalytics;