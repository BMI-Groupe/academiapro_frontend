import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import studentService from "../../api/services/studentService";
import reportCardService from "../../api/services/reportCardService";
import gradeService from "../../api/services/gradeService";
import assignmentService from "../../api/services/assignmentService";
import { useCustomModal } from "../../context/ModalContext";

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  const [student, setStudent] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStudentDetails();
    }
  }, [id]);

  useEffect(() => {
    if (selectedYear) {
      fetchYearData();
    }
  }, [selectedYear]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const res = await studentService.get(parseInt(id!));
      if (res && res.success) {
        setStudent(res.data);
        // Fetch enrollments
        if (res.data.enrollments) {
          setEnrollments(res.data.enrollments);
          if (res.data.enrollments.length > 0) {
            setSelectedYear(res.data.enrollments[0].school_year);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearData = async () => {
    if (!selectedYear || !id) return;
    
    setLoading(true);
    try {
      // Fetch assignments for this year
      const assignRes = await assignmentService.list({ 
        school_year_id: selectedYear.id 
      });
      
      let assignmentItems: any[] = [];
      if (assignRes && assignRes.success) {
        if (Array.isArray(assignRes.data)) {
          if (assignRes.data[0] && Array.isArray(assignRes.data[0].data)) {
            assignmentItems = assignRes.data[0].data;
          } else {
            assignmentItems = assignRes.data as any[];
          }
        } else if (assignRes.data && Array.isArray(assignRes.data.data)) {
          assignmentItems = assignRes.data.data;
        }
      }
      setAssignments(assignmentItems);

      // Fetch grades for this student and year
      const gradeRes = await gradeService.list({ 
        student_id: parseInt(id!),
        school_year_id: selectedYear.id 
      });
      
      let gradeItems: any[] = [];
      if (gradeRes && gradeRes.success) {
        if (Array.isArray(gradeRes.data)) {
          if (gradeRes.data[0] && Array.isArray(gradeRes.data[0].data)) {
            gradeItems = gradeRes.data[0].data;
          } else {
            gradeItems = gradeRes.data as any[];
          }
        } else if (gradeRes.data && Array.isArray(gradeRes.data.data)) {
          gradeItems = gradeRes.data.data;
        }
      }
      setGrades(gradeItems);

      // Fetch report cards
      const reportRes = await reportCardService.getByStudent(parseInt(id!), {
        school_year_id: selectedYear.id
      });
      
      let reportItems: any[] = [];
      if (reportRes && reportRes.success) {
        if (Array.isArray(reportRes.data)) {
          reportItems = reportRes.data;
        } else if (reportRes.data && Array.isArray(reportRes.data.data)) {
          reportItems = reportRes.data.data;
        }
      }
      setReportCards(reportItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReportCard = async () => {
    if (!selectedYear || !id) return;

    openModal({
      title: "Générer un bulletin",
      description: "Voulez-vous générer un bulletin pour cette année scolaire ?",
      variant: "info",
      primaryLabel: "Générer",
      primaryAction: async () => {
        try {
          await reportCardService.generate(parseInt(id!), selectedYear.id);
          openModal({
            title: "Succès",
            description: "Bulletin généré avec succès.",
            variant: "success",
          });
          fetchYearData();
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de générer le bulletin.",
            variant: "error",
          });
        }
      },
    });
  };

  const handleDownloadReportCard = async (reportCardId: number) => {
    try {
      const blob = await reportCardService.download(reportCardId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bulletin-${student?.matricule}-${selectedYear?.label}.pdf`;
      link.click();
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Impossible de télécharger le bulletin.",
        variant: "error",
      });
    }
  };

  if (loading && !student) {
    return (
      <>
        <PageMeta title="Détails de l'élève" description="Chargement..." />
        <PageBreadcrumb pageTitle="Détails de l'élève" />
        <div className="text-center py-8">Chargement...</div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <PageMeta title="Élève introuvable" description="Élève introuvable" />
        <PageBreadcrumb pageTitle="Élève introuvable" />
        <div className="text-center py-8">Élève introuvable</div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${student.first_name} ${student.last_name}`} description="Détails de l'élève" />
      <PageBreadcrumb pageTitle="Détails de l'élève" />

      <div className="space-y-6">
        {/* Student Info Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-gray-500 mt-1">Matricule: {student.matricule}</p>
            </div>
            <Button onClick={() => navigate(`/students/${id}/edit`)}>
              Modifier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-500">Date de naissance</p>
              <p className="font-medium text-gray-800 dark:text-white">{student.birth_date || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Genre</p>
              <p className="font-medium text-gray-800 dark:text-white">{student.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Adresse</p>
              <p className="font-medium text-gray-800 dark:text-white">{student.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date d'inscription</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {student.created_at ? new Date(student.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* School Years */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Années scolaires
          </h3>
          
          {enrollments.length === 0 ? (
            <p className="text-gray-500">Aucune inscription trouvée.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {enrollments.map((enrollment) => (
                <button
                  key={enrollment.id}
                  onClick={() => setSelectedYear(enrollment.school_year)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedYear?.id === enrollment.school_year?.id
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  }`}
                >
                  {enrollment.school_year?.label || "N/A"}
                  <span className="ml-2 text-xs">
                    ({enrollment.classroom?.name || "N/A"})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Details */}
        {selectedYear && (
          <>
            {/* Assignments and Grades */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Examens et Notes - {selectedYear.label}
                </h3>
                <Button onClick={handleGenerateReportCard}>
                  Générer un bulletin
                </Button>
              </div>

              {assignments.length === 0 ? (
                <p className="text-gray-500">Aucun examen trouvé pour cette année.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Examen</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Matière</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Note</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => {
                        const grade = grades.find(g => g.assignment_id === assignment.id);
                        return (
                          <tr key={assignment.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-800 dark:text-white">{assignment.title}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {assignment.subject?.name || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {assignment.evaluation_type?.name || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-800 dark:text-white font-medium">
                              {grade ? grade.score : "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {assignment.max_score}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Report Cards */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Bulletins - {selectedYear.label}
              </h3>

              {reportCards.length === 0 ? (
                <p className="text-gray-500">Aucun bulletin trouvé pour cette année.</p>
              ) : (
                <div className="space-y-3">
                  {reportCards.map((reportCard) => (
                    <div
                      key={reportCard.id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg dark:border-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {reportCard.title || "Bulletin"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Généré le {new Date(reportCard.generated_at).toLocaleDateString()}
                        </p>
                        {reportCard.average && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Moyenne: {reportCard.average} | Rang: {reportCard.rank || "N/A"}
                          </p>
                        )}
                      </div>
                      <Button onClick={() => handleDownloadReportCard(reportCard.id)}>
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
