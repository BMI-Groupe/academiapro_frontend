import React from "react";
import useAuth from "../../providers/auth/useAuth.ts";

interface SchoolOverviewProps {
  activeYear: any;
  loading?: boolean;
}

export default function SchoolOverview({ activeYear, loading }: SchoolOverviewProps) {
  const authContext = useAuth();
  // @ts-ignore
  const userInfo = authContext?.userInfo as any;

  if (loading) {
      return (
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 animate-pulse">
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>
              <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>)}
              </div>
          </div>
      );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Information de l'école</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Données principales et année scolaire active</p>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Utilisateur connecté</p>
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {userInfo?.name ? userInfo.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                  <p className="text-base font-medium text-gray-800 dark:text-white/90">{userInfo?.name || "-"}</p>
                  <p className="text-xs text-gray-400">{userInfo?.email || ""}</p>
              </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 mb-1">Année scolaire active</p>
          <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {activeYear ? `${activeYear.label}` : "Non définie"}
              </p>
          </div>
          {activeYear && (
              <p className="text-xs text-gray-400 mt-1">
                  Du {new Date(activeYear.start_date).toLocaleDateString()} au {new Date(activeYear.end_date).toLocaleDateString()}
              </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 mb-1">Contact</p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">{userInfo?.phone || "-"}</p>
        </div>
      </div>
    </div>
  );
}
