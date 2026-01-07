import React from "react";
import SimpleChart from "../ecommerce/SimpleChart";

interface EnrollmentsByYearChartProps {
  data: Array<{
    year_id: number;
    year_label: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    enrollment_count: number;
  }> | null;
  loading?: boolean;
}

export default function EnrollmentsByYearChart({ data, loading }: EnrollmentsByYearChartProps) {
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
          Inscriptions par Année
        </h4>
        <p className="text-sm text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Préparer les données pour le graphique
  const categories = data.map((item) => item.year_label);
  const seriesData = data.map((item) => item.enrollment_count);

  const chartData = {
    categories,
    series: [
      {
        name: "Nombre d'inscriptions",
        data: seriesData,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 h-full flex flex-col">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Inscriptions par Année Scolaire
      </h4>
      <div className="flex-1 min-h-0">
        <SimpleChart data={chartData} loading={false} height={300} />
      </div>
    </div>
  );
}

