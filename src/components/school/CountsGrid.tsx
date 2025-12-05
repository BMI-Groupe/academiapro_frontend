import React, {useEffect, useState} from "react";
import classroomService from "../../api/services/classroomService";
import studentService from "../../api/services/studentService";
import teacherService from "../../api/services/teacherService";

export default function CountsGrid() {
  const [counts, setCounts] = useState({ classes: 0, students: 0, teachers: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes, tRes] = await Promise.all([
          classroomService.list(),
          studentService.list(),
          teacherService.list(),
        ]);

        setCounts({
          classes: cRes?.data?.length || 0,
          students: sRes?.data?.length || 0,
          teachers: tRes?.data?.length || 0,
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Classes</p>
        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white/90">{counts.classes}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Élèves</p>
        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white/90">{counts.students}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Enseignants</p>
        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white/90">{counts.teachers}</p>
      </div>
    </div>
  );
}
