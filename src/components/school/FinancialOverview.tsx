import React from "react";
import StatisticsChart from "../ecommerce/StatisticsChart";
import { DollarLineIcon, CheckCircleIcon, AlertIcon, TimeIcon } from "../../icons";
import { useCountAnimation } from "../../hooks/useCountAnimation";

interface FinancialOverviewProps {
  financialStats: {
    total_revenue: number;
    total_due?: number;
    total_paid?: number;
    total_unpaid?: number;
    remaining_to_pay?: number;
    projected_revenue?: number;
  } | null;
  chartData: any;
  loading?: boolean;
}

interface FinancialCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  loading?: boolean;
}

function FinancialCard({ label, value, icon, color, bgColor, borderColor, loading }: FinancialCardProps) {
  const animatedValue = useCountAnimation({ 
    targetValue: value, 
    duration: 2000,
    enabled: !loading && value > 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`group relative bg-gradient-to-br ${bgColor} p-5 rounded-xl border-2 ${borderColor} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 ${bgColor} rounded-lg`}>
              {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
                className: `w-5 h-5 ${color}`
              }) : icon}
            </div>
            <p className={`text-sm ${color} font-medium`}>{label}</p>
          </div>
          {loading ? (
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
          ) : (
            <p className={`text-2xl font-bold ${color} mt-1 tabular-nums`}>
              {formatCurrency(animatedValue)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
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

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-green-50/50 dark:from-yellow-900/10 dark:to-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <DollarLineIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Aperçu Financier</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Statistiques des écolages et évolution des paiements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <FinancialCard
            label="Total dû"
            value={financialStats?.total_due || 0}
            icon={<DollarLineIcon />}
            color="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            borderColor="border-blue-200 dark:border-blue-800"
            loading={loading}
          />
          
          <FinancialCard
            label="Total Payé"
            value={financialStats?.total_paid || 0}
            icon={<CheckCircleIcon />}
            color="text-green-600 dark:text-green-400"
            bgColor="bg-green-50 dark:bg-green-900/20"
            borderColor="border-green-200 dark:border-green-800"
            loading={loading}
          />
          
          <FinancialCard
            label="Non Payé"
            value={financialStats?.total_unpaid || 0}
            icon={<AlertIcon />}
            color="text-red-600 dark:text-red-400"
            bgColor="bg-red-50 dark:bg-red-900/20"
            borderColor="border-red-200 dark:border-red-800"
            loading={loading}
          />
          
          <FinancialCard
            label="Reste à Payer"
            value={financialStats?.remaining_to_pay || 0}
            icon={<TimeIcon />}
            color="text-orange-600 dark:text-orange-400"
            bgColor="bg-orange-50 dark:bg-orange-900/20"
            borderColor="border-orange-200 dark:border-orange-800"
            loading={loading}
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <DollarLineIcon className="w-4 h-4" />
            Évolution des encaissements
          </h4>
          <StatisticsChart data={chartData} loading={false} />
        </div>
      </div>
    </div>
  );
}
