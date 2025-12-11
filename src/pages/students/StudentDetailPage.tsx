import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import studentDetailService from '../../api/services/studentDetailService';
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
    const [reportCards, setReportCards] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'years' | 'grades' | 'payments' | 'report_cards'>('info');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadStudentData();
        }
    }, [id]);

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
                setEnrollments(enr);
                if (enr.length > 0) {
                    setSelectedYear(enr[0].school_year_id);
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

    useEffect(() => {
        if (selectedYear && id && activeTab === 'report_cards') {
            loadReportCards();
        }
    }, [selectedYear, activeTab]);

    const loadReportCards = async () => {
        if (!selectedYear) return;
        try {
            // Import dynamique pour éviter de charger le service si non utilisé
            const service = (await import("../../api/services/reportCardService")).default;
            const res = await service.list(parseInt(id!), selectedYear);
            if (res.data && res.data.success) {
                setReportCards(res.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement bulletins:', error);
        }
    };

    const loadPayments = async () => {
        if (!selectedYear) return;
        try {
            const res = await paymentService.getStudentPaymentDetails(parseInt(id!), selectedYear);
            if (res.success) {
                setPaymentsData(res.data);
            }
        } catch (error) {
            console.error('Erreur chargement paiements:', error);
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
                            <h3 className="text-lg font-semibold mb-4">Historique des inscriptions</h3>
                            <div className="space-y-4">
                                {enrollments.map((enrollment: any) => (
                                    <div key={enrollment.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                         onClick={() => setSelectedYear(enrollment.school_year_id)}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{enrollment.school_year?.label}</h4>
                                                <p className="text-sm text-gray-600">{enrollment.classroom?.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Inscrit le: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {enrollment.school_year_id === selectedYear && (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                    Sélectionné
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                            {paymentsData ? (
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
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                                    <p className="text-gray-500">Chargement des données financières...</p>
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

                            {reportCards && reportCards.length > 0 ? (
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
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 mb-2">Aucun bulletin généré pour cette année.</p>
                                    <p className="text-xs text-gray-400">Les bulletins sont générés automatiquement lors de la saisie des notes.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
