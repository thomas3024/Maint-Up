import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { useAppContext } from '../../context/AppContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const OFFICE_CLIENT_ID = 'office';
const OFFICE_CLIENT_NAME = 'Charges Bureau';

const OfficeCosts: React.FC = () => {
  const { costs, addCost, deleteCost } = useAppContext();
  const officeCosts = costs.filter(c => c.category === 'office');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;
    addCost({
      clientId: OFFICE_CLIENT_ID,
      clientName: OFFICE_CLIENT_NAME,
      invoiceId: '',
      description: form.description,
      amount: form.amount,
      category: 'office',
      date: new Date(form.date)
    });
    setForm({ date: new Date().toISOString().split('T')[0], description: '', amount: 0 });
  };

  const months = Array.from({ length: 12 }, (_, i) => format(new Date(2025, i, 1), 'MMM yyyy'));
  const totals = months.map(m =>
    officeCosts
      .filter(c => format(c.date, 'MMM yyyy') === m)
      .reduce((sum, c) => sum + c.amount, 0)
  );

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Charges Bureau',
        data: totals,
        backgroundColor: '#6366F1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' } }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toLocaleString('fr-FR')} €`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString('fr-FR') + ' €';
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une dépense de bureau</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Loyer, matériel..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {officeCosts.map(cost => (
              <tr key={cost.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{cost.date.toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{cost.description}</td>
                <td className="px-4 py-2 text-sm font-semibold text-red-600">{cost.amount.toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => deleteCost(cost.id)} className="text-red-600 hover:text-red-800">
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle 2025</h2>
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default OfficeCosts;
