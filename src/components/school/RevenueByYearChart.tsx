import React from "react";
import SimpleChart from "../ecommerce/SimpleChart";

interface RevenueByYearChartProps {
  data: Array<{
    year_id: number;
    year_label: string;
    revenue: number;
  }> | null;
  loading?: boolean;
}

export default function RevenueByYearChart({ data, loading }: RevenueByYearChartProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 mb-8 rounded"></div>
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Chiffre d'Affaire par Année
        </h4>
        <p className="text-sm text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Préparer les données pour le graphique
  const categories = data.map((item) => item.year_label);
  const seriesData = data.map((item) => item.revenue);

  const chartData = {
    categories,
    series: [
      {
        name: "Chiffre d'Affaire (FCFA)",
        data: seriesData,
      },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Chiffre d'Affaire par Année Scolaire
      </h4>
      <div className="flex-1 min-h-0 mb-4">
        <SimpleChart data={chartData} loading={false} height={250} />
      </div>
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item) => (
            <div key={item.year_id} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.year_label}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {formatCurrency(item.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

