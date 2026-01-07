import React from "react";
import { UserIcon, GroupIcon, ArrowRightIcon } from "../../icons";

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
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 h-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Dernières inscriptions</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Les élèves récemment ajoutés</p>
          </div>
        </div>

        <ul className="space-y-3">
          {enrollments.length === 0 && (
            <li className="text-sm text-gray-500 italic py-4 text-center">Aucune inscription récente pour cette période.</li>
          )}
          {enrollments.map((s: any, index: number) => (
            <li 
              key={s.id} 
              className="group/item flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover/item:scale-110 transition-transform">
                  {s.first_name?.[0]?.toUpperCase() || 'E'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white/90 truncate">{s.first_name} {s.last_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <GroupIcon className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Matricule: {s.matricule || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                    {s.classroom}
                  </span>
                  <p className="text-xs text-gray-400 mt-1.5">{new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
