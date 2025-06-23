import React from "react";
import { useAppContext } from "../../context/AppContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface MonthlyReportProps {
  month: number;
  year: number;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ month, year }) => {
  const { getMonthlyReport } = useAppContext();
  const report = getMonthlyReport(month, year);

  const chartData = {
    labels: ["Revenus", "Coûts"],
    datasets: [
      {
        label: report.month,
        data: [report.revenue, report.costs],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["#3B82F6", "#EF4444"],
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
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y.toLocaleString("fr-FR")} €`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: "rgba(107, 114, 128, 0.1)" },
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString("fr-FR") + " €";
          },
        },
      },
    },
  } as const;

  return (
    <div
      id="monthly-report"
      className="p-6 space-y-6 bg-white rounded-lg shadow-sm"
    >
      <h2 className="text-2xl font-bold text-gray-900">Bilan {report.month}</h2>

      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">Revenus</p>
          <p className="font-semibold text-blue-600">
            {report.revenue.toLocaleString("fr-FR")} €
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Coûts</p>
          <p className="font-semibold text-red-600">
            {report.costs.toLocaleString("fr-FR")} €
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Bénéfice</p>
          <p
            className={`font-semibold ${report.profit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {report.profit.toLocaleString("fr-FR")} €
          </p>
        </div>
      </div>

      {report.invoices.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Factures</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Numéro</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Montant HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{inv.number}</td>
                  <td className="px-4 py-2">{inv.clientName}</td>
                  <td className="px-4 py-2">
                    {inv.amountHT.toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.costsList.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Coûts</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.costsList.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{c.description}</td>
                  <td className="px-4 py-2">
                    {c.amount.toLocaleString("fr-FR")} €
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

export default MonthlyReport;
