import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import studentService from "../../api/services/studentService";
import { useCustomModal } from "../../context/ModalContext";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [grades, setGrades] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  useEffect(() => {
    if (selectedYear) {
      loadGrades();
    }
  }, [selectedYear]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await studentService.getProfile(parseInt(id!));
      if (res.success) {
        setStudent(res.data.student);
        setSchoolYears(res.data.school_years || []);
        
        // Auto-select the first school year
        if (res.data.school_years && res.data.school_years.length > 0) {
          setSelectedYear(res.data.school_years[0].id.toString());
        }
      }
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger le profil de l'élève.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    if (!selectedYear) return;
    
    setLoadingGrades(true);
    try {
      const res = await studentService.getGrades(parseInt(id!), parseInt(selectedYear));
      if (res.success) {
        setGrades(res.data.grades || []);
        setStatistics(res.data.statistics || null);
      }
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger les notes.",
        variant: "error",
      });
    } finally {
      setLoadingGrades(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Profil élève" description="Chargement..." />
        <PageBreadcrumb pageTitle="Profil élève" />
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <PageMeta title="Profil élève" description="Élève introuvable" />
        <PageBreadcrumb pageTitle="Profil élève" />
        <div className="text-center py-12">
          <p className="text-gray-500">Élève introuvable</p>
          <Button onClick={() => navigate("/students")} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${student.first_name} ${student.last_name}`} description="Profil de l'élève" />
      <PageBreadcrumb pageTitle={`Profil de ${student.first_name} ${student.last_name}`} />

      <div className="space-y-6">
        {/* Student Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
                {student.first_name} {student.last_name}
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Matricule:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white/90">
                    {student.registration_number || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Date de naissance:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white/90">
                    {student.birth_date || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Classe actuelle:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white/90">
                    {student.classroom?.name || "Non assigné"}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/students")}>
              Retour
            </Button>
          </div>
        </div>

        {/* School Year Selector */}
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

            {statistics && (
              <div className="flex items-center gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Moyenne générale</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.average}/20
                  </div>
                </div>
                {statistics.rank && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rang</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statistics.rank}/{statistics.total_students}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Grades Table */}
        {selectedYear && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-4">
              Notes et devoirs
            </h3>

            {loadingGrades ? (
              <div className="text-center py-8 text-gray-500">Chargement des notes...</div>
            ) : grades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune note pour cette année scolaire.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Matière
                      </th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Devoir/Examen
                      </th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-900 dark:text-white/90">
                          {grade.subject_name || "Global"}
                        </td>
                        <td className="p-3 text-sm text-gray-900 dark:text-white/90">
                          {grade.assignment_title}
                        </td>
                        <td className="p-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs ${
                              grade.assignment_type === "exam"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {grade.assignment_type === "exam" ? "Examen" : "Devoir"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white/90">
                            {grade.score}/{grade.max_score}
                          </span>
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
