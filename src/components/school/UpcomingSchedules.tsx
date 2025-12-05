import React, {useEffect, useState} from "react";
import scheduleService from "../../api/services/scheduleService";

export default function UpcomingSchedules() {
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await scheduleService.list({ per_page: 5 });
        // The API returns [paginator] in res.data, so we need to access res.data[0].data
        setSchedules(res?.data?.[0]?.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Emploi du temps prochain</h4>
      <p className="text-sm text-gray-500 mt-1">Prochains créneaux pour les classes</p>

      <ul className="mt-4 space-y-3">
        {schedules.length === 0 && (
          <li className="text-sm text-gray-500">Aucun créneau programmé.</li>
        )}
        {schedules.map((s: any) => (
          <li key={s.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white/90">{s.classroom?.name || s.classroom_id || "Classe"}</p>
              <p className="text-sm text-gray-500">{s.subject?.name || s.subject_id || "Matière"} — {s.teacher?.user?.name || s.teacher_id || "Prof"}</p>
            </div>
            <div className="text-sm text-gray-500">{s.day_of_week || "-"} {s.start_time || ""}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
