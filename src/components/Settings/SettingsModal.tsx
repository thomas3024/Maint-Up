import React, { useState } from "react";
import { X, Save, FileDown } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import MonthlyReport from "../Reports/MonthlyReport";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { syncData, exportMonthlyPDF } = useAppContext();
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [generating, setGenerating] = useState(false);
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  if (!open) return null;

  const handleSync = async () => {
    await syncData();
    onClose();
  };

  const handleExport = async () => {
    setGenerating(true);
    setPdfLink(null);
    await new Promise((r) => setTimeout(r, 50));
    const url = await exportMonthlyPDF();
    if (url) setPdfLink(url);
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Paramètres
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={handleSync}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Sauvegarder vers le serveur</span>
          </button>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mois du rapport
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />

            <button
              onClick={handleExport}
              className="mt-2 flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              <span>{generating ? "Création..." : "Télécharger PDF"}</span>
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
          {generating && (
            <div className="absolute -z-10 opacity-0">
              <MonthlyReport
                month={parseInt(month.split("-")[1]) - 1}
                year={parseInt(month.split("-")[0])}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
