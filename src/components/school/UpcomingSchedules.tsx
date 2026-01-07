import React from "react";
import { Link } from "react-router-dom";
import { TableIcon, TimeIcon, ArrowRightIcon, UserCircleIcon } from "../../icons";

interface UpcomingSchedulesProps {
  schedules: any[];
  loading?: boolean;
}

const dayColors: { [key: string]: string } = {
  'lundi': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'mardi': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'mercredi': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'jeudi': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'vendredi': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'samedi': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'dimanche': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function UpcomingSchedules({ schedules = [], loading }: UpcomingSchedulesProps) {
  
  if (loading) {
      return (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>
              <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded"></div>)}
              </div>
          </div>
      );
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 h-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TableIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Emplois du temps</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Derniers créneaux ajoutés</p>
            </div>
          </div>
          <Link 
            to="/schedules" 
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition-colors group/link"
          >
            Voir tout
            <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ul className="space-y-3">
          {schedules.length === 0 && (
            <li className="text-sm text-gray-500 italic py-4 text-center">Aucun créneau programmé pour le moment.</li>
          )}
          {schedules.map((s: any, index: number) => {
            const dayLower = (s.day_of_week || '').toLowerCase();
            const dayColor = dayColors[dayLower] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
            
            return (
              <li 
                key={s.id} 
                className="group/item flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-lg ${dayColor} flex items-center justify-center font-bold text-xs shadow-sm group-hover/item:scale-110 transition-transform`}>
                    {dayLower.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white/90 truncate">
                      {s.section?.name || s.section?.display_name || s.classroom?.name || "Classe inconnue"}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {s.subject?.name || "Matière"}
                      </span>
                      {s.teacher?.user?.name && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <UserCircleIcon className="w-3 h-3" />
                          {s.teacher.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TimeIcon className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {s.start_time ? s.start_time.substring(0, 5) : "--:--"} - {s.end_time ? s.end_time.substring(0, 5) : "--:--"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s.day_of_week}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
