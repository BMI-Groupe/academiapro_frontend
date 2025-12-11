import React from "react";
import { Link } from "react-router-dom";

interface UpcomingSchedulesProps {
  schedules: any[];
  loading?: boolean;
}

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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Emplois du temps</h4>
            <p className="text-sm text-gray-500 mt-1">Derniers créneaux ajoutés</p>
        </div>
        <Link to="/schedules" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir tout
        </Link>
      </div>

      <ul className="space-y-3">
        {schedules.length === 0 && (
          <li className="text-sm text-gray-500 italic">Aucun créneau programmé pour le moment.</li>
        )}
        {schedules.map((s: any) => (
          <li key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white/90">{s.classroom?.name || "Classe inconnue"}</p>
              <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {s.subject?.name || "Matière"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {s.teacher?.user?.name ? `• ${s.teacher.user.name}` : ""}
                  </span>
              </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{s.day_of_week}</p>
                <p className="text-xs text-gray-500">{s.start_time ? s.start_time.substring(0, 5) : "--:--"} - {s.end_time ? s.end_time.substring(0, 5) : "--:--"}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
