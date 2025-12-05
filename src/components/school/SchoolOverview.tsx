import React, {useEffect, useState} from "react";
import schoolYearService from "../../api/services/schoolYearService";
import useAuth from "../../providers/auth/useAuth.ts";

export default function SchoolOverview() {
  const authContext = useAuth();
  // @ts-ignore
  const userInfo = authContext?.userInfo as any;
  const [activeYear, setActiveYear] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await schoolYearService.getActive();
        if (res && res.success) {
          setActiveYear(res.data[0] || null);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Information de l'école</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Données principales et année scolaire active</p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm text-gray-500">Directeur</p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">{userInfo?.name || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Année scolaire active</p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">{activeYear ? `${activeYear.label}` : "Non définie"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Contact</p>
          <p className="text-base font-medium text-gray-800 dark:text-white/90">{userInfo?.phone || "-"}</p>
        </div>
      </div>
    </div>
  );
}
