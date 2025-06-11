import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, subMonths } from 'date-fns';
import { useAppContext } from '../../context/AppContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InvoicesMonthlyChart: React.FC = () => {
  const { invoices } = useAppContext();

  // Show invoice data for each month of the year 2025
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2025, i, 1);
    return format(date, 'MMM yyyy');
  });

  const monthTotals = months.map(month =>
    invoices
      .filter(inv => format(inv.issueDate, 'MMM yyyy') === month)
      .reduce((sum, inv) => sum + inv.amountHT, 0)
  );

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Montant HT',
        data: monthTotals,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
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
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            return `Montant: ${value.toLocaleString('fr-FR')} €`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return value.toLocaleString('fr-FR') + ' €';
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
};

export default InvoicesMonthlyChart;
