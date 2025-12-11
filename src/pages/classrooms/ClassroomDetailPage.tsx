import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import classroomDetailService from '../../api/services/classroomDetailService';
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
    const [activeTab, setActiveTab] = useState<'students' | 'ranking' | 'assignments'>('students');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadClassroomData();
        }
    }, [id]);

    const loadClassroomData = async () => {
        try {
            setLoading(true);
            const [detailsRes, assignmentsRes] = await Promise.all([
                classroomDetailService.getDetails(parseInt(id!)),
                classroomDetailService.getAssignments(parseInt(id!))
            ]);

            if (detailsRes.data?.success) {
                const data = detailsRes.data.data;
                setClassroom(data.classroom);
                setStudents(data.students || []);
            }

            if (assignmentsRes.data?.success) {
                setAssignments(assignmentsRes.data.data[0] || []);
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

    const loadRanking = async (assignmentId?: number) => {
        try {
            const params = {
                school_year_id: classroom?.school_year_id,
                ...(assignmentId ? { assignment_id: assignmentId } : {})
            };

            const res = await classroomDetailService.getRanking(parseInt(id!), params);
            
            if (res.data?.success) {
                setRanking(res.data.data);
            }
        } catch (error) {
            openModal({ 
                title: 'Erreur', 
                description: 'Impossible de charger le classement',
                variant: 'error'
            });
        }
    };

    useEffect(() => {
        if (activeTab === 'ranking' && id) {
            loadRanking(selectedAssignment || undefined);
        }
    }, [activeTab, selectedAssignment]);

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
                                        value={selectedAssignment || ''}
                                        onChange={(e) => setSelectedAssignment(e.target.value ? parseInt(e.target.value) : null)}
                                        className="px-4 py-2 border rounded-lg"
                                    >
                                        <option value="">Classement général</option>
                                        {assignments.map((a: any) => (
                                            <option key={a.id} value={a.id}>{a.title}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={printRanking}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <span>🖨️</span> Imprimer / PDF
                                    </button>
                                </div>
                            </div>

                            {ranking && (
                                <>
                                    {ranking.assignment && (
                                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold">{ranking.assignment.title}</h4>
                                            <p className="text-sm text-gray-600">{ranking.assignment.subject?.name}</p>
                                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Moyenne:</span>
                                                    <span className="ml-2 font-bold">{ranking.average?.toFixed(2)}/20</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Plus haute:</span>
                                                    <span className="ml-2 font-bold">{ranking.highest}/20</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Plus basse:</span>
                                                    <span className="ml-2 font-bold">{ranking.lowest}/20</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élève</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        {selectedAssignment ? 'Note' : 'Moyenne'}
                                                    </th>
                                                    {selectedAssignment && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {ranking.ranking?.map((item: any) => (
                                                    <tr key={item.student.id} className={item.rank <= 3 ? 'bg-yellow-50' : ''}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`font-bold ${
                                                                item.rank === 1 ? 'text-yellow-600' :
                                                                item.rank === 2 ? 'text-gray-600' :
                                                                item.rank === 3 ? 'text-orange-600' : ''
                                                            }`}>
                                                                {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                            {item.student.first_name} {item.student.last_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="font-bold text-blue-600">
                                                                {selectedAssignment ? item.score : item.average}/20
                                                            </span>
                                                        </td>
                                                        {selectedAssignment && (
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {item.percentage?.toFixed(1)}%
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Examens de la classe</h3>
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
                                                <p className="text-sm text-gray-500">{assignment.grades_count} notes</p>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
