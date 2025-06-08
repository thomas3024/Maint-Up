import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, Users, Receipt } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnnualReport: React.FC = () => {
  const { getAnnualReport, exportToPDF } = useAppContext();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  const handleExport = async () => {
    const url = await exportToPDF();
    if (url) setPdfLink(url);
  };
  
  const report = getAnnualReport(selectedYear);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Monthly evolution chart
  const monthlyChartData = {
    labels: report.monthlyBreakdown.map(d => d.month),
    datasets: [
      {
        label: 'Revenus HT',
        data: report.monthlyBreakdown.map(d => d.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Coûts',
        data: report.monthlyBreakdown.map(d => d.costs),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Bénéfices',
        data: report.monthlyBreakdown.map(d => d.profit),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  // Client distribution chart
  const clientChartData = {
    labels: report.clientsData.map(c => c.clientName),
    datasets: [
      {
        label: 'Revenus par client',
        data: report.clientsData.map(c => c.revenue),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          '#10B981',
          '#3B82F6',
          '#8B5CF6',
          '#F59E0B',
          '#EF4444',
        ],
        borderWidth: 2,
      }
    ]
  };

  // Profit margin by client
  const marginChartData = {
    labels: report.clientsData.map(c => c.clientName),
    datasets: [
      {
        label: 'Marge bénéficiaire (%)',
        data: report.clientsData.map(c => c.margin),
        backgroundColor: report.clientsData.map(c => 
          c.margin >= 20 ? 'rgba(16, 185, 129, 0.8)' : 
          c.margin >= 10 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: report.clientsData.map(c => 
          c.margin >= 20 ? '#10B981' : 
          c.margin >= 10 ? '#F59E0B' : '#EF4444'
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
            return value.toLocaleString('fr-FR') + ' €';
          }
        }
      }
    }
  };

  return (
    <div id="annual-report" className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Bilan Annuel</h1>
          <p className="text-gray-600">Synthèse complète de l'activité</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger PDF</span>
          </button>
          {pdfLink && (
            <a
              href={pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              Ouvrir le PDF
            </a>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-pastel-green p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 opacity-70">Revenus Totaux</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {report.totalRevenue.toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-pastel-blue p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 opacity-70">Coûts Totaux</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {report.totalCosts.toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-pastel-purple p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800 opacity-70">Bénéfice Net</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {report.totalProfit.toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-50 rounded-lg">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-pastel-coral p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 opacity-70">Marge Moyenne</p>
              <p className="text-2xl font-bold text-red-900 mt-2">
                {report.averageMargin.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-50 rounded-lg">
              <Users className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Évolution Mensuelle {selectedYear}
          </h2>
          <div className="h-80">
            <Line data={monthlyChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Répartition par Client
          </h2>
          <div className="h-80">
            <Doughnut 
              data={clientChartData} 
              options={{
                ...chartOptions,
                scales: undefined,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 11
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Marges Bénéficiaires par Client
        </h2>
        <div className="h-80">
          <Bar data={marginChartData} options={chartOptions} />
        </div>
      </div>

      {/* Client Details Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détail par Client</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
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
              {report.clientsData.map((client) => (
                <tr key={client.clientId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-green-600">
                      {client.revenue.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-blue-600">
                      {client.costs.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-semibold ${
                      client.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {client.profit.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-semibold ${
                      client.margin >= 20 ? 'text-green-600' : 
                      client.margin >= 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {client.margin.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{client.invoicesCount}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnnualReport;