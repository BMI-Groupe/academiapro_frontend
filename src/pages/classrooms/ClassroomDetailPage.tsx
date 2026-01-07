import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import classroomDetailService from '../../api/services/classroomDetailService';
import schoolYearService from '../../api/services/schoolYearService';
import { useCustomModal } from '../../context/ModalContext';

export default function ClassroomDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal } = useCustomModal();
    const [classroom, setClassroom] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [ranking, setRanking] = useState<any>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<number | null>(null);
    const [schoolYears, setSchoolYears] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'students' | 'ranking' | 'assignments'>('students');
    const [loading, setLoading] = useState(true);
    const [loadingRanking, setLoadingRanking] = useState(false);

    useEffect(() => {
        if (id) {
            loadSchoolYears();
            loadClassroomData();
        }
    }, [id]);

    useEffect(() => {
        if (activeTab === 'ranking' && selectedSchoolYear && id) {
            loadAssignmentsForYear(selectedSchoolYear);
        }
    }, [activeTab, selectedSchoolYear]);

    useEffect(() => {
        if (activeTab === 'ranking' && selectedSchoolYear && id) {
            loadRanking(selectedAssignment || undefined);
        }
    }, [activeTab, selectedAssignment, selectedSchoolYear]);

    const loadSchoolYears = async () => {
        try {
            const res = await schoolYearService.list({ per_page: 100 });
            if (res && res.success) {
                let list: any[] = [];
                if (Array.isArray(res.data)) {
                    if (res.data.length > 0 && res.data[0].data && Array.isArray(res.data[0].data)) {
                        list = res.data[0].data;
                    } else {
                        list = res.data;
                    }
                } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    list = res.data.data;
                }
                setSchoolYears(list || []);
                
                // Définir l'année active par défaut
                const activeYear = list.find((y: any) => y.is_active);
                if (activeYear) {
                    setSelectedSchoolYear(activeYear.id);
                }
            }
        } catch (error) {
            console.error('Error loading school years:', error);
        }
    };

    const loadClassroomData = async () => {
        try {
            setLoading(true);
            const detailsRes = await classroomDetailService.getDetails(parseInt(id!));

            if (detailsRes.data?.success) {
                const data = detailsRes.data.data;
                setClassroom(data.classroom);
                setStudents(data.students || []);
            }
        } catch (error) {
            openModal({ 
                title: 'Erreur', 
                description: 'Impossible de charger les données de la classe',
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadAssignmentsForYear = async (schoolYearId: number) => {
        try {
            const assignmentsRes = await classroomDetailService.getAssignments(parseInt(id!), schoolYearId);
            if (assignmentsRes.data?.success) {
                setAssignments(assignmentsRes.data.data[0] || []);
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
            setAssignments([]);
        }
    };

    const loadRanking = async (assignmentId?: number) => {
        if (!selectedSchoolYear) {
            setRanking(null);
            return;
        }

        try {
            setLoadingRanking(true);
            const params = {
                school_year_id: selectedSchoolYear,
                ...(assignmentId ? { assignment_id: assignmentId } : {})
            };

            const res = await classroomDetailService.getRanking(parseInt(id!), params);
            
            if (res.data?.success) {
                // La structure de la réponse peut être res.data.data[0] ou res.data.data directement
                let rankingData: any = null;
                if (Array.isArray(res.data.data)) {
                    // Si c'est un tableau, prendre le premier élément
                    rankingData = res.data.data.length > 0 ? res.data.data[0] : null;
                } else if (res.data.data && typeof res.data.data === 'object') {
                    // Si c'est un objet direct
                    rankingData = res.data.data;
                }
                
                // S'assurer que ranking.ranking est toujours un tableau (même vide)
                if (rankingData && !Array.isArray(rankingData.ranking)) {
                    rankingData.ranking = rankingData.ranking || [];
                }
                
                setRanking(rankingData);
            } else {
                setRanking(null);
            }
        } catch (error) {
            console.error('Error loading ranking:', error);
            openModal({ 
                title: 'Erreur', 
                description: 'Impossible de charger le classement',
                variant: 'error'
            });
            setRanking(null);
        } finally {
            setLoadingRanking(false);
        }
    };

    const printRanking = () => {
        if (!ranking || !ranking.ranking) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            openModal({
                title: 'Erreur',
                description: 'Veuillez autoriser les pop-ups pour imprimer',
                variant: 'error'
            });
            return;
        }

        const title = selectedAssignment 
            ? `Classement - ${ranking.assignment.title}`
            : `Classement Général - ${classroom.name}`;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .header h1 { margin: 0; color: #2563eb; }
                    .header p { margin: 5px 0 0; color: #666; }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                    .stat-box { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
                    .stat-label { font-size: 14px; color: #64748b; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { text-align: left; padding: 12px; background: #f1f5f9; border-bottom: 2px solid #e2e8f0; font-size: 14px; color: #475569; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    .rank-1 { color: #d97706; font-weight: bold; }
                    .rank-2 { color: #475569; font-weight: bold; }
                    .rank-3 { color: #b45309; font-weight: bold; }
                    .score { font-weight: bold; color: #2563eb; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>Classe : ${classroom.name} | Effectif : ${ranking.student_count || ranking.ranking.length} élèves</p>
                    <p>Date : ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-value">${ranking.average?.toFixed(2) || ranking.class_average?.toFixed(2)}/20</div>
                        <div class="stat-label">Moyenne de la classe</div>
                    </div>
                     ${ranking.highest ? `
                    <div class="stat-box">
                        <div class="stat-value">${ranking.highest}/20</div>
                        <div class="stat-label">Meilleure note</div>
                    </div>
                    ` : ''}
                    ${ranking.lowest ? `
                    <div class="stat-box">
                        <div class="stat-value">${ranking.lowest}/20</div>
                        <div class="stat-label">Note la plus basse</div>
                    </div>
                    ` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 80px">Rang</th>
                            <th>Élève</th>
                            <th style="text-align: right">Note/Moyenne</th>
                            ${selectedAssignment ? '<th style="text-align: right">%</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${ranking.ranking.map((item: any) => `
                            <tr>
                                <td class="rank-${item.rank}">
                                    ${item.rank === 1 ? '🥇 1er' : item.rank === 2 ? '🥈 2ème' : item.rank === 3 ? '🥉 3ème' : item.rank + 'ème'}
                                </td>
                                <td>${item.student.first_name} ${item.student.last_name}</td>
                                <td style="text-align: right" class="score">${selectedAssignment ? item.score : item.average}/20</td>
                                ${selectedAssignment ? `<td style="text-align: right">${item.percentage?.toFixed(0)}%</td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
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

    if (!classroom) {
        return <div className="p-6">Classe non trouvée</div>;
    }

    return (
        <div className="p-6">
            <PageMeta title={classroom.name} description={`Détails de la classe ${classroom.name}`} />
            <PageBreadcrumb pageTitle={classroom.name} />

            {/* En-tête classe */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{classroom.name}</h1>
                        <div className="flex gap-6 text-sm">
                            <div>
                                <span className="text-gray-500">Cycle:</span>
                                <span className="ml-2 font-semibold capitalize">{classroom.cycle}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Niveau:</span>
                                <span className="ml-2 font-semibold">{classroom.level}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Écolage:</span>
                                <span className="ml-2 font-semibold">{classroom.tuition_fee?.toLocaleString()} FCFA</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Effectif:</span>
                                <span className="ml-2 font-semibold">{students.length} élèves</span>
                            </div>
                        </div>
                        {classroom.classroom_template_id && (
                            <div className="mt-4">
                                <button
                                    onClick={() => {
                                        const yearParam = classroom.school_year_id 
                                            ? `?school_year_id=${classroom.school_year_id}` 
                                            : '';
                                        navigate(`/classroom-templates/${classroom.classroom_template_id}/subjects${yearParam}`);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-lg text-brand-700 dark:text-brand-300 font-medium transition-colors duration-200 shadow-sm hover:shadow"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span>Gérer les matières</span>
                                    <span className="text-xs bg-brand-200 dark:bg-brand-800 px-2 py-0.5 rounded">
                                        {classroom.classroom_template?.name || 'Template'}
                                    </span>
                                </button>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Les matières sont gérées par année scolaire pour ce niveau
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {[
                            { key: 'students', label: 'Élèves' },
                            { key: 'ranking', label: 'Classement' },
                            { key: 'assignments', label: 'Examens' }
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
                    {activeTab === 'students' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Liste des élèves ({students.length})</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student: any) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.matricule}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{student.last_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.first_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.gender}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => navigate(`/students/${student.id}`)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Voir détails
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ranking' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Classement</h3>
                                <div className="flex gap-3">
                                    <select
                                        value={selectedSchoolYear || ''}
                                        onChange={(e) => {
                                            const yearId = e.target.value ? parseInt(e.target.value) : null;
                                            setSelectedSchoolYear(yearId);
                                            setSelectedAssignment(null);
                                            setRanking(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 focus:border-brand-500 focus:outline-none"
                                    >
                                        <option value="">Sélectionner une année scolaire</option>
                                        {schoolYears.map((year: any) => (
                                            <option key={year.id} value={year.id}>
                                                {year.label} {year.is_active ? '(Active)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedAssignment || ''}
                                        onChange={(e) => setSelectedAssignment(e.target.value ? parseInt(e.target.value) : null)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 focus:border-brand-500 focus:outline-none"
                                        disabled={!selectedSchoolYear || loadingRanking}
                                    >
                                        <option value="">
                                            {!selectedSchoolYear ? "Sélectionnez d'abord une année" : "Classement général"}
                                        </option>
                                        {assignments.map((a: any) => (
                                            <option key={a.id} value={a.id}>{a.title}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={printRanking}
                                        disabled={!ranking || loadingRanking}
                                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <span>🖨️</span> Imprimer / PDF
                                    </button>
                                </div>
                            </div>

                            {!selectedSchoolYear && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        Veuillez sélectionner une année scolaire pour afficher le classement.
                                    </p>
                                </div>
                            )}

                            {selectedSchoolYear && assignments.length === 0 && !loadingRanking && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Aucun devoir/examen disponible pour cette année scolaire.
                                    </p>
                                </div>
                            )}

                            {loadingRanking && (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Chargement du classement...</p>
                                </div>
                            )}

                            {!loadingRanking && selectedSchoolYear && selectedAssignment && !ranking && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        Aucune note enregistrée pour cet examen. Veuillez ajouter des notes pour voir le classement.
                                    </p>
                                </div>
                            )}

                            {ranking && (
                                <>
                                    {ranking.assignment && (
                                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <h4 className="font-semibold">{ranking.assignment.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{ranking.assignment.subject?.name}</p>
                                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Moyenne:</span>
                                                    <span className="ml-2 font-bold">{ranking.average?.toFixed(2) || '0.00'}/20</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Plus haute:</span>
                                                    <span className="ml-2 font-bold">{ranking.highest || '0'}/20</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Plus basse:</span>
                                                    <span className="ml-2 font-bold">{ranking.lowest || '0'}/20</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {ranking.ranking && ranking.ranking.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rang</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Élève</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                            {selectedAssignment ? 'Note' : 'Moyenne'}
                                                        </th>
                                                        {selectedAssignment && (
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">%</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {ranking.ranking.map((item: any) => (
                                                        <tr key={item.student.id} className={item.rank <= 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`font-bold ${
                                                                    item.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                                                                    item.rank === 2 ? 'text-gray-600 dark:text-gray-400' :
                                                                    item.rank === 3 ? 'text-orange-600 dark:text-orange-400' : ''
                                                                }`}>
                                                                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                                {item.student.first_name} {item.student.last_name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                                    {selectedAssignment ? (item.score || '0') : (item.average || '0.00')}/20
                                                                </span>
                                                            </td>
                                                            {selectedAssignment && (
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                    {item.percentage?.toFixed(1) || '0.0'}%
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedAssignment 
                                                    ? "Aucune note enregistrée pour cet examen. Veuillez ajouter des notes pour voir le classement."
                                                    : "Aucune note enregistrée pour cette année scolaire. Veuillez ajouter des notes pour voir le classement."
                                                }
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Examens de la classe</h3>
                                <select
                                    value={selectedSchoolYear || ''}
                                    onChange={(e) => {
                                        const yearId = e.target.value ? parseInt(e.target.value) : null;
                                        setSelectedSchoolYear(yearId);
                                        if (yearId) {
                                            loadAssignmentsForYear(yearId);
                                        } else {
                                            setAssignments([]);
                                        }
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 focus:border-brand-500 focus:outline-none"
                                >
                                    <option value="">Sélectionner une année scolaire</option>
                                    {schoolYears.map((year: any) => (
                                        <option key={year.id} value={year.id}>
                                            {year.label} {year.is_active ? '(Active)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!selectedSchoolYear && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        Veuillez sélectionner une année scolaire pour afficher les examens.
                                    </p>
                                </div>
                            )}
                            {selectedSchoolYear && assignments.length === 0 && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Aucun examen/devoir disponible pour cette année scolaire.
                                    </p>
                                </div>
                            )}
                            {selectedSchoolYear && assignments.length > 0 && (
                                <div className="grid gap-4">
                                    {assignments.map((assignment: any) => (
                                        <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{assignment.title}</h4>
                                                    <p className="text-sm text-gray-600">{assignment.subject?.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Date limite: {new Date(assignment.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">{assignment.grades_count || 0} notes</p>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAssignment(assignment.id);
                                                            setActiveTab('ranking');
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                                                    >
                                                        Voir classement →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
