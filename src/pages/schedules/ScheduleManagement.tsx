import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { useCustomModal } from "../../context/ModalContext";
import scheduleService from "../../api/services/scheduleService";
import classroomService from "../../api/services/classroomService";
import schoolYearService from "../../api/services/schoolYearService";
import Label from "../../components/form/Label";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import useAuth from "../../providers/auth/useAuth";

const DAYS = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function ScheduleManagement() {
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const { userInfo } = useAuth();
  // @ts-ignore
  const userRole = userInfo?.role;
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !selectedSchoolYear) {
      setSelectedSchoolYear(activeSchoolYear.id.toString());
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (selectedClassroom || selectedSchoolYear) {
      fetchSchedules();
    }
  }, [selectedClassroom, selectedSchoolYear]);

  const loadData = async () => {
    try {
      const [classRes, yearRes] = await Promise.all([
        classroomService.list(),
        schoolYearService.list(),
      ]);

      const extractItems = (res: any) => {
        if (!res?.success) return [];
        if (Array.isArray(res.data)) {
          const firstItem = res.data[0];
          if (Array.isArray(firstItem)) return firstItem;
          if (firstItem && typeof firstItem === 'object' && Array.isArray(firstItem.data)) {
            return firstItem.data;
          }
          return res.data;
        }
        if (res.data && Array.isArray(res.data.data)) {
          return res.data.data;
        }
        return [];
      };

      setClassrooms(extractItems(classRes));
      setSchoolYears(extractItems(yearRes));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedClassroom) params.classroom_id = selectedClassroom;
      if (selectedSchoolYear) params.school_year_id = selectedSchoolYear;

      const res = await scheduleService.list(params);
      if (res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          const firstItem = res.data[0];
          if (Array.isArray(firstItem)) {
            items = firstItem;
          } else if (firstItem && Array.isArray(firstItem.data)) {
            items = firstItem.data;
          } else {
            items = res.data;
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        setSchedules(items || []);
      } else {
        setSchedules([]);
      }
    } catch (e) {
      console.error(e);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (schedule: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer ce cours ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await scheduleService.remove(schedule.id);
          openModal({
            title: "Succès",
            description: "Cours supprimé avec succès.",
            variant: "success",
          });
          await fetchSchedules();
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de supprimer le cours.",
            variant: "error",
          });
        }
      },
    });
  };

  const getScheduleForSlot = (day: string, time: string) => {
    return schedules.find((s) => {
      if (s.day_of_week !== day) return false;
      const startTime = s.start_time?.substring(0, 5); // "08:00:00" -> "08:00"
      return startTime === time;
    });
  };

  return (
    <>
      <PageMeta title="Gestion des emplois du temps" description="Gestion des emplois du temps" />
      <PageBreadcrumb pageTitle="Gestion des emplois du temps" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">Emplois du temps</h2>
            <p className="text-sm text-gray-500 mt-1">Visualisez et gérez les emplois du temps des classes.</p>
          </div>
          {userRole !== 'enseignant' && (
            <Button onClick={() => navigate("/schedules/new")}>+ Ajouter un cours</Button>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Année scolaire</Label>
              <select
                value={selectedSchoolYear}
                onChange={(e) => setSelectedSchoolYear(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Toutes les années</option>
                {schoolYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Classe</Label>
              <select
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Sélectionner une classe</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        {selectedClassroom && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 gap-2">
                {/* Header */}
                <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 p-2">Heure</div>
                {DAYS.map((day) => (
                  <div key={day.value} className="font-semibold text-sm text-gray-700 dark:text-gray-300 p-2 text-center">
                    {day.label}
                  </div>
                ))}

                {/* Time Slots */}
                {TIME_SLOTS.map((time) => (
                  <React.Fragment key={time}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 p-2 border-t border-gray-200 dark:border-gray-700">
                      {time}
                    </div>
                    {DAYS.map((day) => {
                      const schedule = getScheduleForSlot(day.value, time);
                      return (
                        <div
                          key={`${day.value}-${time}`}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-h-[80px] relative group"
                        >
                          {schedule ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 h-full">
                              <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                                {schedule.subject?.name || "Matière"}
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                {schedule.teacher?.first_name} {schedule.teacher?.last_name}
                              </div>
                              {schedule.room && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  Salle {schedule.room}
                                </div>
                              )}
                              <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                                {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}
                              </div>
                              
                              {/* Action buttons */}
                              {userRole !== 'enseignant' && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={() => navigate(`/schedules/edit?id=${schedule.id}`)}
                                    className="bg-white dark:bg-gray-800 p-1 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Modifier"
                                  >
                                    <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(schedule)}
                                    className="bg-white dark:bg-gray-800 p-1 rounded shadow-sm hover:bg-red-100 dark:hover:bg-red-900"
                                    title="Supprimer"
                                  >
                                    <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-500">Chargement...</div>
            )}

            {!loading && schedules.length === 0 && selectedClassroom && (
              <div className="text-center py-8 text-gray-500">
                Aucun cours trouvé pour cette classe.
              </div>
            )}
          </div>
        )}

        {!selectedClassroom && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900 text-center">
            <p className="text-gray-500">Veuillez sélectionner une classe pour afficher l'emploi du temps.</p>
          </div>
        )}
      </div>
    </>
  );
}
