import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import classroomService from "../../api/services/classroomService";
import assignmentService from "../../api/services/assignmentService";
import schoolYearService from "../../api/services/schoolYearService";
import { useCustomModal } from "../../context/ModalContext";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeSchoolYear && !selectedYear) {
      setSelectedYear(activeSchoolYear.id.toString());
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (selectedYear) {
      loadAssignments();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedYear && selectedAssignment) {
      loadRanking();
    }
  }, [selectedYear, selectedAssignment]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classRes, yearRes] = await Promise.all([
        classroomService.get(parseInt(id!)),
        schoolYearService.list(),
      ]);

      if (classRes.success) {
        setClassroom(classRes.data);
      }

      if (yearRes.success) {
        const extractItems = (res: any) => {
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
        setSchoolYears(extractItems(yearRes));
      }
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger les informations de la classe.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await assignmentService.list({ school_year_id: selectedYear });
      if (res.success) {
        const extractItems = (res: any) => {
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
        setAssignments(extractItems(res));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRanking = async () => {
    setLoadingRanking(true);
    try {
      const res = await classroomService.getRanking(
        parseInt(id!),
        parseInt(selectedYear),
        selectedAssignment ? parseInt(selectedAssignment) : undefined
      );
      if (res.success) {
        setStudents(res.data.students || []);
      }
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger le classement.",
        variant: "error",
      });
    } finally {
      setLoadingRanking(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Détail classe" description="Chargement..." />
        <PageBreadcrumb pageTitle="Détail classe" />
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </>
    );
  }

  if (!classroom) {
    return (
      <>
        <PageMeta title="Détail classe" description="Classe introuvable" />
        <PageBreadcrumb pageTitle="Détail classe" />
        <div className="text-center py-12">
          <p className="text-gray-500">Classe introuvable</p>
          <Button onClick={() => navigate("/classrooms")} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={classroom.name} description="Détail de la classe" />
      <PageBreadcrumb pageTitle={`Classe ${classroom.name}`} />

      <div className="space-y-6">
        {/* Classroom Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
                {classroom.name}
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Code:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white/90">
                    {classroom.code || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Cycle:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white/90">
                    {classroom.cycle || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Niveau:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white/90">
                    {classroom.level || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/classrooms")}>
              Retour
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Année scolaire</Label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Sélectionner une année</option>
                {schoolYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Examen/Composition</Label>
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                disabled={!selectedYear}
              >
                <option value="">Toutes les évaluations</option>
                {assignments
                  .filter((a) => a.type === "exam")
                  .map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        {selectedYear && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                Classement des élèves
              </h3>
              {students.length > 0 && (
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger PDF
                </Button>
              )}
            </div>

            {loadingRanking ? (
              <div className="text-center py-8 text-gray-500">Chargement du classement...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune note disponible pour cette sélection.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Rang
                      </th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Matricule
                      </th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Nom complet
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Moyenne
                      </th>
                      <th className="text-center p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="p-3">
                          <div className="flex items-center">
                            {item.rank <= 3 ? (
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                  item.rank === 1
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : item.rank === 2
                                    ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                }`}
                              >
                                {item.rank}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-gray-900 dark:text-white/90">
                                {item.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.student.registration_number || "N/A"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => navigate(`/students/${item.student.id}`)}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {item.student.first_name} {item.student.last_name}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white/90">
                            {item.average}/20
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => navigate(`/students/${item.student.id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="Voir le profil"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
