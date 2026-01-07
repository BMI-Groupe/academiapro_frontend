import React from "react";
import useAuth from "../../providers/auth/useAuth.ts";
import { UserCircleIcon, CalenderIcon, MailIcon } from "../../icons";

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
    <div className="group relative rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 h-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <UserCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Information de l'école</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Données principales et année scolaire active</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="group/item">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Utilisateur connecté</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {userInfo?.name ? userInfo.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                  <p className="text-base font-semibold text-gray-800 dark:text-white/90">{userInfo?.name || "-"}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MailIcon className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo?.email || ""}</p>
                  </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 group/item">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Année scolaire active</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CalenderIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></span>
                    <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                        {activeYear ? `${activeYear.label}` : "Non définie"}
                    </p>
                </div>
                {activeYear && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Du {new Date(activeYear.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} au {new Date(activeYear.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 group/item">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Contact</p>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <p className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                <span className="text-lg">📞</span>
                {userInfo?.phone || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
