import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash,
  Home
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO, startOfMonth, addMonths } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Types
export type ExpenseType = 'fixed' | 'variable' | 'salary';

interface OfficeExpense {
  id: string;
  date: string; // YYYY-MM-DD
  type: ExpenseType;
  category: string;
  description: string;
  amount: number;
}

const fixedCategories = [
  'google',
  'expert comptable',
  'chat gpt',
  'logiciel',
  'téléphone',
  'kandbazz',
  'bureau',
  'assurance maladie',
  'frais bancaire',
  'linkedin',
  'voiture',
  'assurance voiture',
  'assurance société',
  'mutuelle',
  'retraite',
  'autre'
];

const variableCategories = [
  'essence',
  'péage',
  'formation',
  'outils',
  'hotel',
  'vêtements',
  'autre'
];

const salaryCategories = ['salaire', 'charge', 'autre'];

const STORAGE_KEY = 'office-expenses';

const OfficeCosts: React.FC = () => {
  const [expenses, setExpenses] = useState<OfficeExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as OfficeExpense[];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (type: ExpenseType) => {
    const newExpense: OfficeExpense = {
      id: Date.now().toString(),
      date: '2025-01-01',
      type,
      category:
        type === 'fixed'
          ? fixedCategories[0]
          : type === 'variable'
          ? variableCategories[0]
          : salaryCategories[0],
      description: '',
      amount: 0
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, partial: Partial<OfficeExpense>) => {
    setExpenses(expenses.map(e => (e.id === id ? { ...e, ...partial } : e)));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const renderTable = (type: ExpenseType, categories: string[], title: string) => {
    const filtered = expenses.filter(e => e.type === type);
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={() => addExpense(type)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      value={expense.date}
                      onChange={e => updateExpense(expense.id, { date: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={expense.category}
                      onChange={e => updateExpense(expense.id, { category: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={expense.description}
                      onChange={e => updateExpense(expense.id, { description: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={expense.amount}
                      onChange={e => updateExpense(expense.id, { amount: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => deleteExpense(expense.id)} className="text-red-600 hover:text-red-800">
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Prepare chart data
  const months = Array.from({ length: 12 }, (_, i) => format(addMonths(new Date(2025, 0, 1), i), 'MMM yyyy'));

  const totalByMonth = (type: ExpenseType) => {
    return months.map((_, idx) => {
      const start = startOfMonth(addMonths(new Date(2025, 0, 1), idx));
      const end = startOfMonth(addMonths(new Date(2025, 0, 1), idx + 1));
      return expenses
        .filter(e => e.type === type && parseISO(e.date) >= start && parseISO(e.date) < end)
        .reduce((sum, e) => sum + e.amount, 0);
    });
  };

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Frais fixes',
        data: totalByMonth('fixed'),
        backgroundColor: '#3B82F6'
      },
      {
        label: 'Frais variables',
        data: totalByMonth('variable'),
        backgroundColor: '#EF4444'
      },
      {
        label: 'Salaires',
        data: totalByMonth('salary'),
        backgroundColor: '#10B981'
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
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('fr-FR')} €`;
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
      {renderTable('fixed', fixedCategories, 'Frais fixes')}
      {renderTable('variable', variableCategories, 'Frais variables')}
      {renderTable('salary', salaryCategories, 'Salaires')}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h2>
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default OfficeCosts;
