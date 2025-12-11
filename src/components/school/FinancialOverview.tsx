import React from "react";
import StatisticsChart from "../ecommerce/StatisticsChart";

interface FinancialOverviewProps {
  financialStats: {
    total_revenue: number;
    projected_revenue?: number;
  } | null;
  chartData: any;
  loading?: boolean;
}

export default function FinancialOverview({ financialStats, chartData, loading }: FinancialOverviewProps) {
  
  if (loading) {
      return (
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 mb-8 rounded"></div>
              <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
      );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Aperçu Financier</h3>
        <p className="text-sm text-gray-500">Chiffre d'affaires et évolution des paiements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Chiffre d'Affaires Total</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {formatCurrency(financialStats?.total_revenue || 0)}
          </p>
        </div>
        {/* On pourrait ajouter ici le prévisionnel ou le reste à recouvrer */}
      </div>

      <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Évolution des encaissements</h4>
          <StatisticsChart data={chartData} loading={false} />
      </div>
    </div>
  );
}
