import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import studentService from "../../api/services/studentService";
import reportCardService from "../../api/services/reportCardService";
import gradeService from "../../api/services/gradeService";
import assignmentService from "../../api/services/assignmentService";
import classroomService from "../../api/services/classroomService";
import schoolYearService from "../../api/services/schoolYearService";
import { useCustomModal } from "../../context/ModalContext";
import paymentService from "../../api/services/paymentService";

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
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [reassigning, setReassigning] = useState(false);

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
          // Trier les inscriptions par année scolaire (plus récente en premier)
          const sortedEnrollments = [...res.data.enrollments].sort((a, b) => {
            const dateA = a.school_year?.start_date || '';
            const dateB = b.school_year?.start_date || '';
            return dateB.localeCompare(dateA);
          });
          setEnrollments(sortedEnrollments);
          if (sortedEnrollments.length > 0) {
            setSelectedYear(sortedEnrollments[0].school_year);
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
      // Fetch report cards
      const reportRes = await reportCardService.list(parseInt(id!), selectedYear.id);
      
      let reportItems: any[] = [];
      if (reportRes && reportRes.success) {
        if (Array.isArray(reportRes.data)) {
          reportItems = reportRes.data;
        } else if (reportRes.data && Array.isArray(reportRes.data.data)) {
          reportItems = reportRes.data.data;
        }
      }
      setReportCards(reportItems);

      // Fetch payments
      const paymentRes = await paymentService.getStudentPaymentDetails(parseInt(id!), selectedYear.id);
      if (paymentRes && paymentRes.success) {
          setPaymentsData(paymentRes.data);
      }

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
      const res = await reportCardService.download(reportCardId);
      const url = window.URL.createObjectURL(res.data);
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

  const handleReassignClassroom = async (enrollment: any) => {
    // Charger les classes disponibles pour l'année scolaire
    setReassigning(true);
    try {
      const res = await classroomService.list({ school_year_id: enrollment.school_year?.id });
      let items: any[] = [];
      if (res && res.success) {
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else {
            items = res.data as any[];
          }
        }
      }
      setClassrooms(items);

      // Ouvrir le modal de sélection
      openModal({
        title: `Réaffecter l'élève - ${enrollment.school_year?.label}`,
        description: `Sélectionnez la nouvelle classe pour ${student?.first_name} ${student?.last_name} pour l'année ${enrollment.school_year?.label}.`,
        variant: "info",
        content: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classe actuelle
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {enrollment.classroom?.name || "Aucune classe assignée"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouvelle classe *
              </label>
              <select
                id="new-classroom"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Sélectionnez une classe</option>
                {items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.level ? `(${c.level})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ),
        primaryLabel: "Réaffecter",
        primaryAction: async () => {
          const select = document.getElementById('new-classroom') as HTMLSelectElement;
          const newClassroomId = select?.value;
          
          if (!newClassroomId) {
            openModal({
              title: "Erreur",
              description: "Veuillez sélectionner une classe.",
              variant: "error",
            });
            return;
          }

          try {
            await studentService.reassignClassroom(
              parseInt(id!),
              parseInt(newClassroomId),
              enrollment.school_year?.id
            );
            openModal({
              title: "Succès",
              description: "L'élève a été réaffecté avec succès.",
              variant: "success",
            });
            fetchStudentDetails();
            if (selectedYear?.id === enrollment.school_year?.id) {
              fetchYearData();
            }
          } catch (e: any) {
            console.error(e);
            openModal({
              title: "Erreur",
              description: e?.response?.data?.message || "Impossible de réaffecter l'élève.",
              variant: "error",
            });
          }
        },
      });
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger les classes disponibles.",
        variant: "error",
      });
    } finally {
      setReassigning(false);
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

        {/* Timeline chronologique du cursus */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Parcours scolaire - Historique complet
          </h3>
          
          {enrollments.length === 0 ? (
            <p className="text-gray-500">Aucune inscription trouvée.</p>
          ) : (
            <div className="space-y-4">
              {/* Timeline verticale */}
              <div className="relative">
                {enrollments.map((enrollment, index) => {
                  const isSelected = selectedYear?.id === enrollment.school_year?.id;
                  const startDate = enrollment.school_year?.start_date 
                    ? new Date(enrollment.school_year.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
                    : '';
                  const endDate = enrollment.school_year?.end_date 
                    ? new Date(enrollment.school_year.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
                    : '';
                  
                  return (
                    <div key={enrollment.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      {/* Ligne verticale */}
                      {index < enrollments.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                      )}
                      
                      {/* Point de timeline */}
                      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-warning-500 border-warning-600' 
                          : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          isSelected ? 'bg-warning-600' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      
                      {/* Contenu */}
                      <button
                        onClick={() => setSelectedYear(enrollment.school_year)}
                        className={`flex-1 text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-warning-50 border-warning-300 dark:bg-warning-900/20 dark:border-warning-700 shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:border-warning-300 hover:bg-warning-50/50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-warning-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold ${
                            isSelected 
                              ? 'text-warning-700 dark:text-warning-400' 
                              : 'text-gray-800 dark:text-white'
                          }`}>
                            {enrollment.school_year?.label || "Année inconnue"}
                          </h4>
                          <div className="flex items-center gap-2">
                            {enrollment.school_year?.is_active && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                Active
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReassignClassroom(enrollment);
                              }}
                              className="px-3 py-1 text-xs font-medium text-warning-700 bg-warning-100 hover:bg-warning-200 rounded-lg transition-colors dark:text-warning-400 dark:bg-warning-900/30 dark:hover:bg-warning-900/50"
                              title="Réaffecter à une autre classe"
                            >
                              Réaffecter
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {enrollment.classroom?.name || "Classe non assignée"}
                          </span>
                          {(startDate || endDate) && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {startDate} - {endDate}
                            </span>
                          )}
                          {enrollment.enrolled_at && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Inscrit le {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
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

            {/* Payments Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Paiements - {selectedYear.label}
              </h3>

              {paymentsData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Balance Summary */}
                  <div className="bg-gray-50 p-4 rounded-xl dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">État financier</h4>
                    <div className="space-y-2">
                       <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Frais de scolarité:</span>
                        <span className="font-semibold">{paymentsData.balance?.total_due} {paymentsData.balance?.currency}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Total payé:</span>
                         <span className="font-semibold text-green-600">{paymentsData.balance?.total_paid} {paymentsData.balance?.currency}</span>
                      </div>
                       <div className="flex justify-between border-t pt-2 mt-2">
                         <span className="text-gray-800 dark:text-white font-bold">Reste à payer:</span>
                         <span className={`font-bold ${paymentsData.balance?.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                           {paymentsData.balance?.balance} {paymentsData.balance?.currency}
                         </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment History - Only show if there are payments */}
                  {paymentsData.payments && paymentsData.payments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Historique des versements</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {paymentsData.payments.map((payment: any) => (
                          <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                            <div>
                               <p className="text-sm font-medium text-gray-800 dark:text-white">
                                 {payment.amount} {paymentsData.balance?.currency}
                               </p>
                               <div className="flex gap-2 text-xs text-gray-500">
                                 <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                                 <span>•</span>
                                 <span>REF: {payment.reference}</span>
                               </div>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-300">
                              {payment.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                 <div className="text-center py-4 text-gray-500">Chargement des données financières...</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
