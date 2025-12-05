import React, {useEffect, useState} from "react";
import studentService from "../../api/services/studentService";

export default function RecentEnrollments() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await studentService.list({ per_page: 5 });
        // The API returns [paginator] in res.data, so we need to access res.data[0].data
        setStudents(res?.data?.[0]?.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Dernières inscriptions</h4>
      <p className="text-sm text-gray-500 mt-1">Les élèves récemment ajoutés</p>

      <ul className="mt-4 space-y-3">
        {students.length === 0 && (
          <li className="text-sm text-gray-500">Aucune inscription récente.</li>
        )}
        {students.map((s: any) => (
          <li key={s.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white/90">{s.first_name} {s.last_name}</p>
              <p className="text-sm text-gray-500">Matricule: {s.matricule || "-"}</p>
            </div>
            <div className="text-sm text-gray-500">{new Date(s.created_at || Date.now()).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
