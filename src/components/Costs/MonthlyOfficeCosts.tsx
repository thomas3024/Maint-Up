import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const fixedCategories = [
  'Google',
  'Expert comptable',
  'ChatGPT',
  'Logiciel',
  'Téléphone',
  'Kandbazz',
  'Bureau',
  'Assurance maladie',
  'Frais bancaires',
  'LinkedIn',
  'Voiture',
  'Assurance voiture',
  'Assurance société',
  'Mutuelle',
  'Retraite',
  'Autre'
];

const variableCategories = [
  'Essence',
  'Péage',
  'Formation',
  'Outils',
  'Hôtel',
  'Vêtements',
  'TVA',
  'Autre'
];

const payrollCategories = ['Salaire', 'Charges', 'Prime performance', 'Autre'];

interface FormState {
  category: string;
  amount: number;
  comment: string;
}

interface SectionProps {
  title: string;
  type: 'fixed' | 'variable' | 'payroll';
  costs: any[];
  monthDate: Date;
}

const Section: React.FC<SectionProps> = ({ title, type, costs, monthDate }) => {
  const { addCost, deleteCost } = useAppContext();
  const categories =
    type === 'fixed'
      ? fixedCategories
      : type === 'variable'
      ? variableCategories
      : payrollCategories;

  const [form, setForm] = useState<FormState>({
    category: categories[0],
    amount: 0,
    comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return;
    addCost({
      clientId: 'office',
      clientName: 'Charges Bureau',
      invoiceId: '',
      description: form.comment,
      amount: form.amount,
      category: 'office',
      officeType: type,
      officeCategory: form.category,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    });
    setForm({ ...form, amount: 0, comment: '' });
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-sm font-medium text-gray-700">Catégorie</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Montant (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Commentaire</label>
          <input
            type="text"
            value={form.comment}
            onChange={e => setForm({ ...form, comment: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button type="submit" className="flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </button>
      </form>
      {costs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {costs.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{c.officeCategory}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-red-600">{c.amount.toLocaleString('fr-FR')} €</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{c.description}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => deleteCost(c.id)} className="text-red-600 hover:text-red-800">
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MonthlyOfficeCosts: React.FC = () => {
  const { costs } = useAppContext();
  const officeCosts = costs.filter(c => c.category === 'office');
  const months = Array.from({ length: 12 }, (_, i) => new Date(2025, i, 1));
  const [open, setOpen] = useState<number | null>(0);

  const monthLabels = months.map(m => format(m, 'MMM yyyy'));
  const fixedTotals = months.map(m =>
    officeCosts
      .filter(
        c =>
          c.officeType === 'fixed' && format(c.date, 'yyyy-MM') === format(m, 'yyyy-MM')
      )
      .reduce((s, c) => s + c.amount, 0)
  );
  const variableTotals = months.map(m =>
    officeCosts
      .filter(
        c =>
          c.officeType === 'variable' && format(c.date, 'yyyy-MM') === format(m, 'yyyy-MM')
      )
      .reduce((s, c) => s + c.amount, 0)
  );
  const payrollTotals = months.map(m =>
    officeCosts
      .filter(
        c =>
          c.officeType === 'payroll' && format(c.date, 'yyyy-MM') === format(m, 'yyyy-MM')
      )
      .reduce((s, c) => s + c.amount, 0)
  );

  const yearlyChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Frais fixes',
        data: fixedTotals,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Frais variables',
        data: variableTotals,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Salaires & Charges',
        data: payrollTotals,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const distributionData = {
    labels: ['Frais fixes', 'Frais variables', 'Salaires & Charges'],
    datasets: [
      {
        data: [
          fixedTotals.reduce((s, v) => s + v, 0),
          variableTotals.reduce((s, v) => s + v, 0),
          payrollTotals.reduce((s, v) => s + v, 0)
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: ['#6366F1', '#F59E0B', '#10B981'],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-4">
      {months.map((m, idx) => {
        const label = format(m, 'MMMM yyyy');
        const monthCosts = officeCosts.filter(c => format(c.date, 'yyyy-MM') === format(m, 'yyyy-MM'));
        const fixed = monthCosts.filter(c => c.officeType === 'fixed');
        const variable = monthCosts.filter(c => c.officeType === 'variable');
        const payroll = monthCosts.filter(c => c.officeType === 'payroll');
        const isOpen = open === idx;
        return (
          <div key={idx} className="border rounded-lg">
            <button
              className="w-full text-left px-4 py-3 bg-gray-100 font-semibold"
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              {label}
            </button>
            {isOpen && (
              <div className="p-4 space-y-6">
                <Section title="Frais fixes" type="fixed" costs={fixed} monthDate={m} />
                <Section title="Frais variables" type="variable" costs={variable} monthDate={m} />
                <Section title="Salaires & Charges" type="payroll" costs={payroll} monthDate={m} />
                {(fixed.length > 0 || variable.length > 0 || payroll.length > 0) && (
                  <div className="h-72">
                    <Bar
                      data={{
                        labels: ['Frais fixes', 'Frais variables', 'Salaires & Charges'],
                        datasets: [
                          {
                            label: 'Montant',
                            data: [
                              fixed.reduce((s, c) => s + c.amount, 0),
                              variable.reduce((s, c) => s + c.amount, 0),
                              payroll.reduce((s, c) => s + c.amount, 0)
                            ],
                            backgroundColor: [
                              'rgba(99, 102, 241, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(16, 185, 129, 0.8)'
                            ],
                            borderColor: ['#6366F1', '#F59E0B', '#10B981'],
                            borderWidth: 2
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              font: { size: 12, weight: '500' }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#e5e7eb',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                              label: function (context: any) {
                                const value = context.parsed.y;
                                return `${value.toLocaleString('fr-FR')} €`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { color: '#6B7280', font: { size: 11 } }
                          },
                          y: {
                            grid: { color: 'rgba(107, 114, 128, 0.1)' },
                            ticks: {
                              color: '#6B7280',
                              font: { size: 11 },
                              callback: function (value: any) {
                                return value.toLocaleString('fr-FR') + ' €';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {(fixedTotals.some(t => t > 0) || variableTotals.some(t => t > 0) || payrollTotals.some(t => t > 0)) && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle 2025</h2>
            <div className="h-80">
              <Line data={yearlyChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' } }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                      label: function(context: any) {
                        const value = context.parsed.y;
                        return `${value.toLocaleString('fr-FR')} €`;
                      }
                    }
                  }
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#6B7280', font: { size: 11 } } },
                  y: {
                    grid: { color: 'rgba(107, 114, 128, 0.1)' },
                    ticks: {
                      color: '#6B7280',
                      font: { size: 11 },
                      callback: function(value: any) { return value.toLocaleString('fr-FR') + ' €'; }
                    }
                  }
                }
              }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition annuelle</h2>
            <div className="h-80">
              <Doughnut data={distributionData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' } }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                  }
                }
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyOfficeCosts;
