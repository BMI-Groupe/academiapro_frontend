import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import teacherService from "../../api/services/teacherService";

export default function TeacherDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTeacherDetails();
    }
  }, [id]);

  const fetchTeacherDetails = async () => {
    setLoading(true);
    try {
      const res = await teacherService.get(parseInt(id!));
      if (res && res.success) {
        setTeacher(res.data);
        // Assignments would be classroom-subject-teacher relationships
        if (res.data.classroom_subject_teachers) {
          setAssignments(res.data.classroom_subject_teachers);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !teacher) {
    return (
      <>
        <PageMeta title="Détails de l'enseignant" description="Chargement..." />
        <PageBreadcrumb pageTitle="Détails de l'enseignant" />
        <div className="text-center py-8">Chargement...</div>
      </>
    );
  }

  if (!teacher) {
    return (
      <>
        <PageMeta title="Enseignant introuvable" description="Enseignant introuvable" />
        <PageBreadcrumb pageTitle="Enseignant introuvable" />
        <div className="text-center py-8">Enseignant introuvable</div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${teacher.first_name} ${teacher.last_name}`} description="Détails de l'enseignant" />
      <PageBreadcrumb pageTitle="Détails de l'enseignant" />

      <div className="space-y-6">
        {/* Teacher Info Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {teacher.first_name} {teacher.last_name}
              </h2>
              <p className="text-gray-500 mt-1">{teacher.specialization || "Enseignant"}</p>
            </div>
            <Button onClick={() => navigate(`/teachers/${id}/edit`)}>
              Modifier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="font-medium text-gray-800 dark:text-white">{teacher.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="font-medium text-gray-800 dark:text-white">{teacher.birth_date || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Spécialisation</p>
              <p className="font-medium text-gray-800 dark:text-white">{teacher.specialization || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date d'embauche</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Affectations
          </h3>

          {assignments.length === 0 ? (
            <p className="text-gray-500">Aucune affectation trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Année scolaire</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Classe</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Matière</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-800 dark:text-white">
                        {assignment.school_year?.label || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {assignment.classroom_subject?.classroom?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {assignment.classroom_subject?.subject?.name || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
