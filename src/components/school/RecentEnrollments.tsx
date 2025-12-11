import React from "react";

interface RecentEnrollmentsProps {
  enrollments: any[];
  loading?: boolean;
}

export default function RecentEnrollments({ enrollments = [], loading }: RecentEnrollmentsProps) {
  
  if (loading) {
      return (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>
              <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>)}
              </div>
          </div>
      );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 h-full">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Dernières inscriptions</h4>
      <p className="text-sm text-gray-500 mt-1 mb-4">Les élèves récemment ajoutés</p>

      <ul className="space-y-4">
        {enrollments.length === 0 && (
          <li className="text-sm text-gray-500 italic">Aucune inscription récente pour cette période.</li>
        )}
        {enrollments.map((s: any) => (
          <li key={s.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
            <div>
              <p className="font-medium text-gray-800 dark:text-white/90">{s.first_name} {s.last_name}</p>
              <p className="text-xs text-gray-500">Matricule: {s.matricule || "-"}</p>
            </div>
            <div className="text-right">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                    {s.classroom}
                </span>
                <p className="text-xs text-gray-400 mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
