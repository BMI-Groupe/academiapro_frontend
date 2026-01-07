import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import studentDetailService from '../../api/services/studentDetailService';
import studentService from '../../api/services/studentService';
import classroomService from '../../api/services/classroomService';
import schoolYearService from '../../api/services/schoolYearService';
import { useCustomModal } from '../../context/ModalContext';
import paymentService from '../../api/services/paymentService';

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { openModal } = useCustomModal();
    const [student, setStudent] = useState<any>(null);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [grades, setGrades] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [paymentsData, setPaymentsData] = useState<any>(null);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [reportCards, setReportCards] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'years' | 'grades' | 'payments' | 'report_cards'>('info');
    const [loading, setLoading] = useState(true);
    const [loadingReportCards, setLoadingReportCards] = useState(false);
    const [schoolYears, setSchoolYears] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadStudentData();
            loadSchoolYears();
        }
    }, [id]);

    const loadSchoolYears = async () => {
        try {
            const res = await schoolYearService.list();
            if (res && res.success) {
                let items: any[] = [];
                if (Array.isArray(res.data)) {
                    // Check if the first element is a paginator object (has .data array)
                    if (res.data[0] && Array.isArray(res.data[0].data)) {
                        items = res.data[0].data;
                    } 
                    // Check if the first element is the array of items itself (non-paginated case)
                    else if (res.data[0] && Array.isArray(res.data[0])) {
                        items = res.data[0];
                    }
                    // Fallback: assume res.data is the list (though unlikely given the controller)
                    else {
                        items = res.data as any[];
                    }
                } else if (res.data && Array.isArray(res.data.data)) {
                    items = res.data.data;
                }
                setSchoolYears(items || []);
            }
        } catch (error) {
            console.error('Erreur chargement années scolaires:', error);
        }
    };

    const loadStudentData = async () => {
        try {
            setLoading(true);
            const [detailsRes, enrollmentsRes] = await Promise.all([
                studentDetailService.getDetails(parseInt(id!)),
                studentDetailService.getEnrollments(parseInt(id!))
            ]);

            if (detailsRes.data?.success) {
                setStudent(detailsRes.data.data[0]);
            }

            if (enrollmentsRes.data?.success) {
                const enr = enrollmentsRes.data.data[0] || [];
                // Trier les inscriptions : actives d'abord, puis par date (plus récente en premier)
                const sortedEnrollments = [...enr].sort((a: any, b: any) => {
                    // Priorité : active > repeated > completed
                    const statusOrder = { 'active': 0, 'repeated': 1, 'completed': 2 };
                    const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
                    const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
                    
                    if (statusA !== statusB) {
                        return statusA - statusB;
                    }
                    
                    // Si même statut, trier par date (plus récente en premier)
                    const dateA = a.school_year?.start_date || '';
                    const dateB = b.school_year?.start_date || '';
                    return dateB.localeCompare(dateA);
                });
                setEnrollments(sortedEnrollments);
                if (sortedEnrollments.length > 0) {
                    // Sélectionner la première inscription active, sinon la première
                    const activeEnrollment = sortedEnrollments.find((e: any) => e.status === 'active');
                    setSelectedYear(activeEnrollment?.school_year_id || sortedEnrollments[0].school_year_id);
                }
            }
        } catch (error) {
            openModal({ 
                title: 'Erreur', 
                description: 'Impossible de charger les données de l\'élève',
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedYear && id) {
            loadGradesAndAssignments();
        }
    }, [selectedYear]);

    const loadGradesAndAssignments = async () => {
        try {
            const [gradesRes, assignmentsRes] = await Promise.all([
                studentDetailService.getGrades(parseInt(id!), selectedYear!),
                studentDetailService.getAssignments(parseInt(id!), selectedYear!)
            ]);

            if (gradesRes.data?.success) {
                setGrades(gradesRes.data.data);
            }

            if (assignmentsRes.data?.success) {
                setAssignments(assignmentsRes.data.data[0] || []);
            }
        } catch (error) {
            console.error('Erreur chargement notes:', error);
        }
    };

    useEffect(() => {
        if (selectedYear && id && activeTab === 'payments') {
            loadPayments();
        }
    }, [selectedYear, activeTab]);

    // Load report cards automatically when year is selected (to trigger calculation)
    useEffect(() => {
        if (selectedYear && id) {
            loadReportCards();
        }
    }, [selectedYear, id]);

    // Also reload when switching to report_cards tab
    useEffect(() => {
        if (selectedYear && id && activeTab === 'report_cards') {
            loadReportCards();
        }
    }, [activeTab]);

    const loadReportCards = async () => {
        if (!selectedYear) return;
        setLoadingReportCards(true);
        try {
            // Import dynamique pour éviter de charger le service si non utilisé
            const service = (await import("../../api/services/reportCardService")).default;
            const res = await service.list(parseInt(id!), selectedYear);
            
            if (res && res.success) {
                // La structure peut être res.data directement ou res.data[0]
                let cards: any[] = [];
                if (Array.isArray(res.data)) {
                    cards = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    cards = res.data.data;
                } else if (res.data && typeof res.data === 'object') {
                    // Si c'est un objet unique, le mettre dans un tableau
                    cards = [res.data];
                }
                setReportCards(cards);
            } else {
                setReportCards([]);
            }
        } catch (error) {
            console.error('Erreur chargement bulletins:', error);
            setReportCards([]);
        } finally {
            setLoadingReportCards(false);
        }
    };

    const loadPayments = async () => {
        if (!selectedYear) {
            setPaymentsData(null);
            return;
        }
        setLoadingPayments(true);
        try {
            const res = await paymentService.getStudentPaymentDetails(parseInt(id!), selectedYear);
            if (res.success) {
                setPaymentsData(res.data);
            } else {
                setPaymentsData(null);
            }
        } catch (error) {
            console.error('Erreur chargement paiements:', error);
            setPaymentsData(null);
        } finally {
            setLoadingPayments(false);
        }
    };

    const printReportCard = () => {
        if (!student || !grades) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            openModal({
                title: 'Erreur',
                description: 'Veuillez autoriser les pop-ups pour imprimer',
                variant: 'error'
            });
            return;
        }

        const selectedYearLabel = enrollments.find(e => e.school_year_id === selectedYear)?.school_year?.label || 'Année inconnue';

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bulletin - ${student.first_name} ${student.last_name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .header h1 { margin: 0; color: #1e3a8a; font-size: 28px; }
                    .header h2 { margin: 10px 0 0; color: #64748b; font-size: 18px; font-weight: normal; }
                    
                    .student-info { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .info-group label { display: block; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                    .info-group div { font-weight: 600; font-size: 16px; color: #0f172a; }

                    .summary-box { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
                    .summary-value { font-size: 32px; font-weight: bold; }
                    .summary-label { font-size: 14px; opacity: 0.8; }

                    table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                    th { text-align: left; padding: 15px; background: #e2e8f0; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                    td { padding: 15px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
                    tr:last-child td { border-bottom: none; }
                    
                    .subject-row { background: #f8fafc; font-weight: bold; }
                    .subject-name { color: #1e293b; }
                    .subject-average { color: #2563eb; text-align: right; }
                    
                    .grade-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
                    .grade-item:last-child { border-bottom: none; }
                    .grade-date { color: #94a3b8; font-size: 12px; }
                    
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
                    
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Bulletin de Notes</h1>
                    <h2>${selectedYearLabel}</h2>
                </div>

                <div class="student-info">
                    <div class="info-group">
                        <label>Élève</label>
                        <div>${student.first_name} ${student.last_name}</div>
                    </div>
                    <div class="info-group">
                        <label>Matricule</label>
                        <div>${student.matricule}</div>
                    </div>
                    <div class="info-group">
                        <label>Classe</label>
                        <div>${enrollments.find(e => e.school_year_id === selectedYear)?.classroom?.name || 'N/A'}</div>
                    </div>
                </div>

                <div class="summary-box">
                    <div class="summary-value">${grades.overall_average?.toFixed(2) || '0.00'}/20</div>
                    <div class="summary-label">Moyenne Générale</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Matière / Devoirs</th>
                            <th style="width: 100px; text-align: right">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grades.by_subject?.map((subjectData: any) => `
                            <tr class="subject-row">
                                <td class="subject-name">${subjectData.subject.name}</td>
                                <td class="subject-average">${subjectData.average.toFixed(2)}/20</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 0 15px 15px 15px;">
                                    ${subjectData.grades.map((grade: any) => `
                                        <div class="grade-item">
                                            <div>
                                                ${grade.assignment.title}
                                                <span class="grade-date"> - ${new Date(grade.graded_at).toLocaleDateString()}</span>
                                            </div>
                                            <div><strong>${grade.score}</strong>/20</div>
                                        </div>
                                    `).join('')}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Généré le ${new Date().toLocaleDateString()} • AcademiaPro</p>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const handleEnrollStudent = async () => {
        try {
            // Charger les années scolaires disponibles
            let yearsList: any[] = [];
            if (schoolYears.length > 0) {
                yearsList = schoolYears;
            } else {
                const res = await schoolYearService.list();
                if (res && res.success) {
                    if (Array.isArray(res.data)) {
                        // Check if the first element is a paginator object (has .data array)
                        if (res.data[0] && Array.isArray(res.data[0].data)) {
                            yearsList = res.data[0].data;
                        } 
                        // Check if the first element is the array of items itself (non-paginated case)
                        else if (res.data[0] && Array.isArray(res.data[0])) {
                            yearsList = res.data[0];
                        }
                        // Fallback: assume res.data is the list (though unlikely given the controller)
                        else {
                            yearsList = res.data as any[];
                        }
                    } else if (res.data && Array.isArray(res.data.data)) {
                        yearsList = res.data.data;
                    }
                }
            }
            
            if (!yearsList || yearsList.length === 0) {
                openModal({
                    title: "Erreur",
                    description: "Aucune année scolaire disponible.",
                    variant: "error",
                });
                return;
            }

            // Variable de closure pour stocker les valeurs sélectionnées
            let enrollData: { schoolYearId: string; classroomId: string } = { schoolYearId: '', classroomId: '' };

            // Composant React pour le contenu du modal
            const EnrollModalContent: React.FC<{ years: any[] }> = ({ years }) => {
                const [selectedYearId, setSelectedYearId] = useState<string>('');
                const [classrooms, setClassrooms] = useState<any[]>([]);
                const [loadingClassrooms, setLoadingClassrooms] = useState(false);
                const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');

                // Mettre à jour la variable de closure quand les valeurs changent
                useEffect(() => {
                    enrollData.schoolYearId = selectedYearId;
                    enrollData.classroomId = selectedClassroomId;
                }, [selectedYearId, selectedClassroomId]);

                // Charger les classes quand l'année scolaire change
                useEffect(() => {
                    const loadClassrooms = async () => {
                        if (!selectedYearId) {
                            setClassrooms([]);
                            setSelectedClassroomId('');
                            return;
                        }

                        setLoadingClassrooms(true);
                        try {
                            const res = await classroomService.list({ school_year_id: parseInt(selectedYearId) });
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
                            setSelectedClassroomId(''); // Réinitialiser la sélection de classe
                        } catch (error) {
                            console.error('Erreur chargement classes:', error);
                            setClassrooms([]);
                        } finally {
                            setLoadingClassrooms(false);
                        }
                    };

                    loadClassrooms();
                }, [selectedYearId]);

                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Année scolaire *
                            </label>
                            <select
                                value={selectedYearId}
                                onChange={(e) => setSelectedYearId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                <option value="">Sélectionnez une année scolaire</option>
                                {years && Array.isArray(years) && years.length > 0 ? (
                                    years
                                        .filter((year) => year && year.id) // Filtrer les années sans ID
                                        .filter((year, index, self) => index === self.findIndex((t) => t.id === year.id))
                                        .map((year, index) => (
                                            <option key={`year-${year.id}-${index}`} value={year.id}>
                                                {year.label} {year.is_active ? '(Active)' : ''}
                                            </option>
                                        ))
                                ) : (
                                    <option value="" disabled>Aucune année scolaire disponible</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Classe *
                            </label>
                            <select
                                value={selectedClassroomId}
                                onChange={(e) => setSelectedClassroomId(e.target.value)}
                                disabled={!selectedYearId || loadingClassrooms}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
                            >
                                <option value="">
                                    {loadingClassrooms 
                                        ? 'Chargement des classes...' 
                                        : !selectedYearId 
                                            ? 'Sélectionnez d\'abord une année scolaire' 
                                            : classrooms.length === 0
                                                ? 'Aucune classe disponible'
                                                : 'Sélectionnez une classe'}
                                </option>
                                {classrooms && classrooms.length > 0 && classrooms.map((c: any, index: number) => (
                                    <option key={c.id || `classroom-${index}`} value={c.id}>
                                        {c.name} {c.level ? `(${c.level})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            };

            // Ouvrir le modal de sélection
            openModal({
                title: enrollments.length > 0 ? `Ajouter une nouvelle année scolaire` : `Inscrire l'élève dans une classe`,
                description: enrollments.length > 0 
                    ? `Sélectionnez une nouvelle année scolaire et une classe pour ${student?.first_name} ${student?.last_name}. Si vous sélectionnez une année où l'élève est déjà inscrit, cela créera une nouvelle inscription (redoublement).`
                    : `Sélectionnez l'année scolaire et la classe pour ${student?.first_name} ${student?.last_name}.`,
                variant: "info",
                content: <EnrollModalContent years={yearsList} />,
                primaryLabel: "Inscrire",
                primaryAction: async () => {
                    if (!enrollData.schoolYearId || !enrollData.classroomId) {
                        openModal({
                            title: "Erreur",
                            description: "Veuillez sélectionner une année scolaire et une classe.",
                            variant: "error",
                        });
                        return;
                    }

                    try {
                        await studentService.reassignClassroom(
                            parseInt(id!),
                            parseInt(enrollData.classroomId),
                            parseInt(enrollData.schoolYearId)
                        );
                        openModal({
                            title: "Succès",
                            description: "L'élève a été inscrit avec succès.",
                            variant: "success",
                        });
                        loadStudentData();
                        setSelectedYear(parseInt(enrollData.schoolYearId));
                    } catch (e: any) {
                        console.error('Erreur inscription élève:', e);
                        // Message générique pour l'utilisateur (sans détails techniques)
                        const errorMessage = e?.response?.data?.message || "Impossible d'inscrire l'élève. Veuillez réessayer.";
                        // Filtrer les messages d'erreur techniques
                        const userFriendlyMessage = errorMessage.includes('SQLSTATE') || errorMessage.includes('Table') || errorMessage.includes('doesn\'t exist')
                            ? "Une erreur est survenue lors de l'inscription. Veuillez contacter l'administrateur si le problème persiste."
                            : errorMessage;
                        openModal({
                            title: "Erreur",
                            description: userFriendlyMessage,
                            variant: "error",
                        });
                    }
                },
            });
        } catch (e) {
            console.error(e);
            openModal({
                title: "Erreur",
                description: "Impossible de charger les données nécessaires.",
                variant: "error",
            });
        }
    };

    const handleReassignClassroom = async (enrollment: any) => {
        try {
            // Charger les années scolaires disponibles
            const years = schoolYears.length > 0 ? schoolYears : (await schoolYearService.list()).data || [];
            let yearsList: any[] = [];
            if (years && Array.isArray(years)) {
                if (years[0] && Array.isArray(years[0].data)) {
                    yearsList = years[0].data;
                } else if (years[0] && Array.isArray(years[0])) {
                    yearsList = years[0];
                } else {
                    yearsList = years as any[];
                }
            } else if (years && Array.isArray(years.data)) {
                yearsList = years.data;
            }

            // Variable de closure pour stocker les valeurs sélectionnées
            let reassignData: { schoolYearId: string; classroomId: string } = { 
                schoolYearId: enrollment.school_year_id.toString(), 
                classroomId: enrollment.classroom_id?.toString() || '' 
            };

            // Composant React pour le contenu du modal
            const ReassignModalContent: React.FC<{ years: any[]; currentEnrollment: any }> = ({ years, currentEnrollment }) => {
                const [selectedYearId, setSelectedYearId] = useState<string>(currentEnrollment.school_year_id.toString());
                const [classrooms, setClassrooms] = useState<any[]>([]);
                const [loadingClassrooms, setLoadingClassrooms] = useState(false);
                const [selectedClassroomId, setSelectedClassroomId] = useState<string>(currentEnrollment.classroom_id?.toString() || '');

                // Mettre à jour la variable de closure quand les valeurs changent
                useEffect(() => {
                    reassignData.schoolYearId = selectedYearId;
                    reassignData.classroomId = selectedClassroomId;
                }, [selectedYearId, selectedClassroomId]);

                // Charger les classes quand l'année scolaire change
                useEffect(() => {
                    const loadClassrooms = async () => {
                        if (!selectedYearId) {
                            setClassrooms([]);
                            setSelectedClassroomId('');
                            return;
                        }

                        setLoadingClassrooms(true);
                        try {
                            const res = await classroomService.list({ school_year_id: parseInt(selectedYearId) });
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
                            // Si on change d'année, réinitialiser la sélection de classe
                            if (selectedYearId !== currentEnrollment.school_year_id.toString()) {
                                setSelectedClassroomId('');
                            }
                        } catch (error) {
                            console.error('Erreur chargement classes:', error);
                            setClassrooms([]);
                        } finally {
                            setLoadingClassrooms(false);
                        }
                    };

                    loadClassrooms();
                }, [selectedYearId]);

                const isSameYear = selectedYearId === currentEnrollment.school_year_id.toString();
                const isSameClass = selectedClassroomId === currentEnrollment.classroom_id?.toString();

                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Inscription actuelle :</strong> {currentEnrollment.classroom?.name || "Aucune classe"} - {currentEnrollment.school_year?.label}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Année scolaire *
                            </label>
                            <select
                                value={selectedYearId}
                                onChange={(e) => setSelectedYearId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                                {years && Array.isArray(years) && years.length > 0 ? (
                                    years
                                        .filter((year) => year && year.id)
                                        .filter((year, index, self) => index === self.findIndex((t) => t.id === year.id))
                                        .map((year, index) => (
                                            <option key={`year-${year.id}-${index}`} value={String(year.id)}>
                                                {year.label} {year.is_active ? '(Active)' : ''}
                                            </option>
                                        ))
                                ) : (
                                    <option value="" disabled>Aucune année scolaire disponible</option>
                                )}
                            </select>
                            {isSameYear && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Même année : correction d'erreur d'affectation
                                </p>
                            )}
                            {!isSameYear && (
                                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                                    Année différente : création d'une nouvelle inscription (redoublement ou passage de classe)
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Classe *
                            </label>
                            <select
                                value={selectedClassroomId}
                                onChange={(e) => setSelectedClassroomId(e.target.value)}
                                disabled={!selectedYearId || loadingClassrooms}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
                            >
                                <option value="">
                                    {loadingClassrooms 
                                        ? 'Chargement des classes...' 
                                        : !selectedYearId 
                                            ? 'Sélectionnez d\'abord une année scolaire' 
                                            : classrooms.length === 0
                                                ? 'Aucune classe disponible'
                                                : 'Sélectionnez une classe'}
                                </option>
                                {classrooms && classrooms.length > 0 && classrooms.map((c: any, index: number) => (
                                    <option key={c.id || `classroom-${index}`} value={c.id}>
                                        {c.name} {c.level ? `(${c.level})` : ''}
                                    </option>
                                ))}
                            </select>
                            {isSameClass && isSameYear && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Même classe et même année : aucune modification nécessaire
                                </p>
                            )}
                            {isSameClass && !isSameYear && (
                                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                                    Même classe, année différente : redoublement dans la même classe
                                </p>
                            )}
                            {!isSameClass && !isSameYear && (
                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                    Classe et année différentes : passage de classe
                                </p>
                            )}
                        </div>
                    </div>
                );
            };

            // Ouvrir le modal de sélection
            openModal({
                title: `Réaffecter l'élève`,
                description: `Modifiez l'année scolaire et/ou la classe pour ${student?.first_name} ${student?.last_name}.`,
                variant: "info",
                content: <ReassignModalContent years={yearsList} currentEnrollment={enrollment} />,
                primaryLabel: "Réaffecter",
                primaryAction: async () => {
                    if (!reassignData.schoolYearId || !reassignData.classroomId) {
                        openModal({
                            title: "Erreur",
                            description: "Veuillez sélectionner une année scolaire et une classe.",
                            variant: "error",
                        });
                        return;
                    }

                    const isSameYear = parseInt(reassignData.schoolYearId) === enrollment.school_year_id;
                    const isSameClass = parseInt(reassignData.classroomId) === enrollment.classroom_id;

                    if (isSameYear && isSameClass) {
                        openModal({
                            title: "Information",
                            description: "Aucune modification nécessaire. L'élève est déjà dans cette classe pour cette année scolaire.",
                            variant: "info",
                        });
                        return;
                    }

                    try {
                        await studentService.reassignClassroom(
                            parseInt(id!),
                            parseInt(reassignData.classroomId),
                            parseInt(reassignData.schoolYearId),
                            enrollment.id,
                            enrollment.school_year_id
                        );
                        openModal({
                            title: "Succès",
                            description: isSameYear 
                                ? "L'élève a été réaffecté avec succès (correction d'erreur)."
                                : "Une nouvelle inscription a été créée avec succès (redoublement ou passage de classe).",
                            variant: "success",
                        });
                        loadStudentData();
                        setSelectedYear(parseInt(reassignData.schoolYearId));
                    } catch (e: any) {
                        console.error('Erreur réaffectation élève:', e);
                        const errorMessage = e?.response?.data?.message || "Impossible de réaffecter l'élève. Veuillez réessayer.";
                        const userFriendlyMessage = errorMessage.includes('SQLSTATE') || errorMessage.includes('Table') || errorMessage.includes('doesn\'t exist')
                            ? "Une erreur est survenue lors de la réaffectation. Veuillez contacter l'administrateur si le problème persiste."
                            : errorMessage;
                        openModal({
                            title: "Erreur",
                            description: userFriendlyMessage,
                            variant: "error",
                        });
                    }
                },
            });
        } catch (e) {
            console.error(e);
            openModal({
                title: "Erreur",
                description: "Impossible de charger les données nécessaires.",
                variant: "error",
            });
        }
    };

    if (loading) {
        return <div className="p-6">Chargement...</div>;
    }

    if (!student) {
        return <div className="p-6">Élève non trouvé</div>;
    }

    return (
        <div className="p-6">
            <PageMeta title={`${student.first_name} ${student.last_name}`} description={`Détails de l'élève ${student.first_name} ${student.last_name}`} />
            <PageBreadcrumb pageTitle={`${student.first_name} ${student.last_name}`} />

            {/* En-tête élève */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                        {student.first_name[0]}{student.last_name[0]}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{student.first_name} {student.last_name}</h1>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Matricule:</span>
                                <p className="font-semibold">{student.matricule}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Date de naissance:</span>
                                <p className="font-semibold">{student.birth_date}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Genre:</span>
                                <p className="font-semibold">{student.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Adresse:</span>
                                <p className="font-semibold">{student.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {[
                            { key: 'info', label: 'Informations' },
                            { key: 'years', label: 'Années scolaires' },
                            { key: 'grades', label: 'Notes & Examens' },
                            { key: 'payments', label: 'Paiements' },
                            { key: 'report_cards', label: 'Bulletins' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'info' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Nom complet</label>
                                    <p className="font-medium">{student.first_name} {student.last_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Matricule</label>
                                    <p className="font-medium">{student.matricule}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Date de naissance</label>
                                    <p className="font-medium">{student.birth_date}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Adresse</label>
                                    <p className="font-medium">{student.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'years' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Parcours scolaire - Historique complet</h3>
                                <button
                                    onClick={handleEnrollStudent}
                                    className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {enrollments.length === 0 ? 'Inscrire dans une classe' : 'Ajouter une nouvelle année'}
                                </button>
                            </div>
                            {enrollments.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-gray-500 mb-2">Aucune inscription trouvée.</p>
                                    <p className="text-sm text-gray-400 mb-4">Cet élève n'est inscrit dans aucune classe pour le moment.</p>
                                    <button
                                        onClick={handleEnrollStudent}
                                        className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-colors inline-flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Inscrire dans une classe
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Timeline verticale */}
                                    <div className="relative">
                                        {enrollments.map((enrollment: any, index: number) => {
                                            const isSelected = selectedYear === enrollment.school_year_id;
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
                                                    <div
                                                        className={`flex-1 p-4 rounded-lg border transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-warning-50 border-warning-300 dark:bg-warning-900/20 dark:border-warning-700 shadow-md'
                                                                : 'bg-gray-50 border-gray-200 hover:border-warning-300 hover:bg-warning-50/50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-warning-600'
                                                        }`}
                                                        onClick={() => setSelectedYear(enrollment.school_year_id)}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`font-semibold ${
                                                                    isSelected 
                                                                        ? 'text-warning-700 dark:text-warning-400' 
                                                                        : 'text-gray-800 dark:text-white'
                                                                }`}>
                                                                    {enrollment.school_year?.label || "Année inconnue"}
                                                                </h4>
                                                                {enrollment.status === 'completed' && (
                                                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full dark:bg-gray-800 dark:text-gray-400">
                                                                        Terminée
                                                                    </span>
                                                                )}
                                                                {enrollment.status === 'repeated' && (
                                                                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                                                                        Redoublement
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {enrollment.school_year?.is_active && enrollment.status === 'active' && (
                                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                                        Active
                                                                    </span>
                                                                )}
                                                                {enrollment.status === 'active' && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            await handleReassignClassroom(enrollment);
                                                                        }}
                                                                        className="px-3 py-1 text-xs font-medium text-warning-700 bg-warning-100 hover:bg-warning-200 rounded-lg transition-colors dark:text-warning-400 dark:bg-warning-900/30 dark:hover:bg-warning-900/50"
                                                                        title="Réaffecter à une autre classe (créera une nouvelle inscription si redoublement)"
                                                                    >
                                                                        Réaffecter
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                {enrollment.classroom?.name || enrollment.section?.name || enrollment.section?.classroom_template?.name || "Classe non assignée"}
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
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'grades' && selectedYear && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Notes & Examens</h3>
                                <div className="flex gap-3">
                                    <select
                                        value={selectedYear || ''}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="px-4 py-2 border rounded-lg"
                                    >
                                        {enrollments.map((e: any) => (
                                            <option key={e.school_year_id} value={e.school_year_id}>
                                                {e.school_year?.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={printReportCard}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <span>🖨️</span> Imprimer Bulletin
                                    </button>
                                </div>
                            </div>

                            {grades && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Moyenne générale</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {grades.overall_average?.toFixed(2) || '0.00'}/20
                                    </p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {grades?.by_subject?.map((subjectData: any) => (
                                    <div key={subjectData.subject.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold">{subjectData.subject.name}</h4>
                                            <span className="text-lg font-bold text-blue-600">
                                                {subjectData.average.toFixed(2)}/20
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {subjectData.grades.map((grade: any) => (
                                                <div key={grade.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                                    <span>{grade.assignment.title}</span>
                                                    <span className="font-semibold">{grade.score}/20</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Historique des paiements</h3>
                                {enrollments.length > 0 ? (
                                    <select
                                        value={selectedYear || ''}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="px-4 py-2 border rounded-lg bg-white"
                                    >
                                        {enrollments.map((e: any) => (
                                            <option key={e.school_year_id} value={e.school_year_id}>
                                                {e.school_year?.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        Aucune inscription - Impossible d'afficher les paiements
                                    </div>
                                )}
                            </div>

                            {!selectedYear ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 mb-2">Aucune année scolaire sélectionnée</p>
                                    <p className="text-sm text-gray-400">Veuillez d'abord inscrire l'élève dans une classe pour voir ses paiements.</p>
                                </div>
                            ) : loadingPayments ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                                    <p className="text-gray-500">Chargement des données financières...</p>
                                </div>
                            ) : paymentsData ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Balance Summary */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">État financier</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total dû</span>
                                                <span className="font-bold text-lg">{paymentsData.balance?.total_due} {paymentsData.balance?.currency}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total payé</span>
                                                <span className="font-bold text-lg text-green-600">{paymentsData.balance?.total_paid} {paymentsData.balance?.currency}</span>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                                <span className="font-bold text-gray-800">Reste à payer</span>
                                                <span className={`font-bold text-xl ${paymentsData.balance?.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    {paymentsData.balance?.balance} {paymentsData.balance?.currency}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment History */}
                                    {paymentsData.payments && paymentsData.payments.length > 0 ? (
                                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Versements effectués</h4>
                                            </div>
                                            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                                                {paymentsData.payments.map((payment: any) => (
                                                    <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold text-gray-800">
                                                                {payment.amount} {paymentsData.balance?.currency}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                                                <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span className="font-mono bg-gray-100 px-1 rounded">REF: {payment.reference}</span>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            {payment.type}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                                            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p className="text-sm font-medium">Aucun paiement enregistré</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 mb-2">Aucune donnée financière disponible</p>
                                    <p className="text-sm text-gray-400">Aucun paiement enregistré pour cette année scolaire.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'report_cards' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Bulletins Officiels</h3>
                                {enrollments.length > 0 && (
                                    <select
                                        value={selectedYear || ''}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="px-4 py-2 border rounded-lg bg-white"
                                    >
                                        {enrollments.map((e: any) => (
                                            <option key={e.school_year_id} value={e.school_year_id}>
                                                {e.school_year?.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {loadingReportCards ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-gray-500">Chargement des bulletins...</p>
                                </div>
                            ) : reportCards && reportCards.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {reportCards.map((rc: any) => (
                                        <div key={rc.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                        {rc.period ? (rc.school_year?.period_system === 'semester' ? 'Semestre ' + rc.period : 'Trimestre ' + rc.period) : 'Annuel'}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">
                                                        {new Date(rc.generated_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                
                                                <h4 className="text-xl font-bold text-gray-800 mb-2">
                                                    Moyenne: {parseFloat(rc.average).toFixed(2)}/20
                                                </h4>
                                                <p className="text-sm text-gray-500 mb-4">
                                                     Rang: {rc.rank} {rc.rank === 1 ? 'er' : 'ème'}
                                                </p>
                                                
                                                <div className="mb-6">
                                                    <p className="text-sm italic text-gray-600 border-l-2 border-gray-300 pl-3">
                                                        "{rc.comments || 'Aucune appréciation'}"
                                                    </p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => navigate(`/report-cards/${rc.id}`)}
                                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Voir le bulletin
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Aucun bulletin disponible pour cette année scolaire.</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {selectedYear 
                                            ? "Les bulletins sont générés automatiquement lorsque des notes sont enregistrées. Si vous avez ajouté des notes, veuillez actualiser la page."
                                            : "Sélectionnez une année scolaire pour voir les bulletins."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
