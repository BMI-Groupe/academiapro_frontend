import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import teacherDetailService from '../../api/services/teacherDetailService';
import teacherService from '../../api/services/teacherService';
import classroomService from '../../api/services/classroomService';
import subjectService from '../../api/services/subjectService';
import schoolYearService from '../../api/services/schoolYearService';
import { useCustomModal } from '../../context/ModalContext';

export default function TeacherDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { openModal } = useCustomModal();
    const [teacher, setTeacher] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'years' | 'subjects' | 'sections'>('info');
    const [loading, setLoading] = useState(true);
    const [schoolYears, setSchoolYears] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadTeacherData();
            loadSchoolYears();
        }
    }, [id]);

    const loadSchoolYears = async () => {
        try {
            const res = await schoolYearService.list();
            if (res && res.success) {
                let items: any[] = [];
                if (Array.isArray(res.data)) {
                    if (res.data[0] && Array.isArray(res.data[0].data)) {
                        items = res.data[0].data;
                    } else if (res.data[0] && Array.isArray(res.data[0])) {
                        items = res.data[0];
                    } else {
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

    const loadTeacherData = async () => {
        try {
            setLoading(true);
            const [detailsRes, assignmentsRes] = await Promise.all([
                teacherDetailService.getDetails(parseInt(id!)),
                teacherDetailService.getAssignments(parseInt(id!))
            ]);

            if (detailsRes.data?.success) {
                setTeacher(detailsRes.data.data[0]);
            }

            if (assignmentsRes.data?.success) {
                const assignData = assignmentsRes.data.data[0] || [];
                setAssignments(assignData);
                if (assignData.length > 0) {
                    // Sélectionner la première année active, sinon la première
                    const activeYear = assignData.find((a: any) => a.school_year?.is_active);
                    setSelectedYear(activeYear?.school_year_id || assignData[0].school_year_id);
                }
            }
        } catch (error) {
            console.error('Erreur chargement données enseignant:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSectionSubject = async () => {
        try {
            let yearsList: any[] = [];
            if (schoolYears.length > 0) {
                yearsList = schoolYears;
            } else {
                const res = await schoolYearService.list();
                if (res && res.success) {
                    if (Array.isArray(res.data)) {
                        if (res.data[0] && Array.isArray(res.data[0].data)) {
                            yearsList = res.data[0].data;
                        } else if (res.data[0] && Array.isArray(res.data[0])) {
                            yearsList = res.data[0];
                        } else {
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

            let assignData: { schoolYearId: string; sectionId: string; subjectId: string } = { 
                schoolYearId: '', 
                sectionId: '', 
                subjectId: '' 
            };

            const AssignModalContent: React.FC<{ years: any[] }> = ({ years }) => {
                const [selectedYearId, setSelectedYearId] = useState<string>('');
                const [sections, setSections] = useState<any[]>([]);
                const [subjects, setSubjects] = useState<any[]>([]);
                const [loadingSections, setLoadingSections] = useState(false);
                const [loadingSubjects, setLoadingSubjects] = useState(false);
                const [selectedSectionId, setSelectedSectionId] = useState<string>('');
                const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

                useEffect(() => {
                    assignData.schoolYearId = selectedYearId;
                    assignData.sectionId = selectedSectionId;
                    assignData.subjectId = selectedSubjectId;
                }, [selectedYearId, selectedSectionId, selectedSubjectId]);

                useEffect(() => {
                    const loadSections = async () => {
                        if (!selectedYearId) {
                            setSections([]);
                            setSelectedSectionId('');
                            return;
                        }

                        setLoadingSections(true);
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
                            setSections(items);
                            setSelectedSectionId('');
                        } catch (error) {
                            console.error('Erreur chargement sections:', error);
                            setSections([]);
                        } finally {
                            setLoadingSections(false);
                        }
                    };

                    loadSections();
                }, [selectedYearId]);

                useEffect(() => {
                    const loadSubjects = async () => {
                        if (!selectedSectionId || !selectedYearId) {
                            setSubjects([]);
                            setSelectedSubjectId('');
                            return;
                        }

                        setLoadingSubjects(true);
                        try {
                            const res = await classroomService.getSubjects(parseInt(selectedSectionId), parseInt(selectedYearId));
                            let items: any[] = [];
                            if (res && res.success) {
                                // Le contrôleur retourne les données dans res.data[0]
                                const responseData = Array.isArray(res.data) ? res.data[0] : res.data;
                                if (Array.isArray(responseData)) {
                                    items = responseData;
                                } else if (responseData && Array.isArray(responseData.data)) {
                                    items = responseData.data;
                                }
                            }
                            console.log('Subjects loaded:', items); // Debug
                            setSubjects(items);
                            setSelectedSubjectId('');
                        } catch (error) {
                            console.error('Erreur chargement matières:', error);
                            setSubjects([]);
                        } finally {
                            setLoadingSubjects(false);
                        }
                    };

                    loadSubjects();
                }, [selectedSectionId, selectedYearId]);

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
                                        .filter((year) => year && year.id)
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
                                Section (Classe) *
                            </label>
                            <select
                                value={selectedSectionId}
                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                disabled={!selectedYearId || loadingSections}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
                            >
                                <option value="">
                                    {loadingSections 
                                        ? 'Chargement des sections...' 
                                        : !selectedYearId 
                                            ? 'Sélectionnez d\'abord une année scolaire' 
                                            : sections.length === 0
                                                ? 'Aucune section disponible'
                                                : 'Sélectionnez une section'}
                                </option>
                                {sections && sections.length > 0 && sections.map((s: any, index: number) => (
                                    <option key={s.id || `section-${index}`} value={s.id}>
                                        {s.name || s.display_name} {s.classroom_template?.level ? `(${s.classroom_template.level})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Matière *
                            </label>
                            <select
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                disabled={!selectedSectionId || loadingSubjects}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
                            >
                                <option value="">
                                    {loadingSubjects 
                                        ? 'Chargement des matières...' 
                                        : !selectedSectionId 
                                            ? 'Sélectionnez d\'abord une section' 
                                            : subjects.length === 0
                                                ? 'Aucune matière disponible pour cette section'
                                                : 'Sélectionnez une matière'}
                                </option>
                                {subjects && subjects.length > 0 && subjects.map((subj: any, index: number) => {
                                    // Les données viennent de SectionSubject avec relation subject
                                    const subjectId = subj.subject_id || subj.subject?.id || subj.id;
                                    const subjectName = subj.subject?.name || subj.name;
                                    const coefficient = subj.coefficient;
                                    
                                    return (
                                        <option key={subjectId || `subject-${index}`} value={subjectId}>
                                            {subjectName} {coefficient ? `(Coef: ${coefficient})` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                );
            };

            openModal({
                title: "Affecter une section et une matière",
                description: `Sélectionnez une année scolaire, une section et une matière pour ${teacher?.first_name} ${teacher?.last_name}.`,
                variant: "info",
                content: <AssignModalContent years={yearsList} />,
                primaryLabel: "Affecter",
                primaryAction: async () => {
                    if (!assignData.schoolYearId || !assignData.sectionId || !assignData.subjectId) {
                        openModal({
                            title: "Erreur",
                            description: "Veuillez sélectionner une année scolaire, une section et une matière.",
                            variant: "error",
                        });
                        return;
                    }

                    try {
                        await teacherDetailService.assignSectionSubject(
                            parseInt(id!),
                            parseInt(assignData.sectionId),
                            parseInt(assignData.subjectId),
                            parseInt(assignData.schoolYearId)
                        );
                        openModal({
                            title: "Succès",
                            description: "L'enseignant a été affecté avec succès.",
                            variant: "success",
                        });
                        loadTeacherData();
                    } catch (e: any) {
                        console.error('Erreur affectation enseignant:', e);
                        const errorMessage = e?.response?.data?.message || "Impossible d'affecter l'enseignant. Veuillez réessayer.";
                        openModal({
                            title: "Erreur",
                            description: errorMessage,
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

    const handleReassignSectionSubject = async (assignment: any) => {
        try {
            let yearsList: any[] = [];
            if (schoolYears.length > 0) {
                yearsList = schoolYears;
            } else {
                const res = await schoolYearService.list();
                if (res && res.success) {
                    if (Array.isArray(res.data)) {
                        if (res.data[0] && Array.isArray(res.data[0].data)) {
                            yearsList = res.data[0].data;
                        } else if (res.data[0] && Array.isArray(res.data[0])) {
                            yearsList = res.data[0];
                        } else {
                            yearsList = res.data as any[];
                        }
                    } else if (res.data && Array.isArray(res.data.data)) {
                        yearsList = res.data.data;
                    }
                }
            }

            let reassignData: { schoolYearId: string; sectionId: string; subjectId: string } = { 
                schoolYearId: assignment.school_year_id?.toString() || '', 
                sectionId: assignment.section?.id?.toString() || '', 
                subjectId: assignment.subject?.id?.toString() || '' 
            };

            const ReassignModalContent: React.FC<{ years: any[]; currentAssignment: any }> = ({ years, currentAssignment }) => {
                const [selectedYearId, setSelectedYearId] = useState<string>(currentAssignment.school_year_id?.toString() || '');
                const [sections, setSections] = useState<any[]>([]);
                const [subjects, setSubjects] = useState<any[]>([]);
                const [loadingSections, setLoadingSections] = useState(false);
                const [loadingSubjects, setLoadingSubjects] = useState(false);
                const [selectedSectionId, setSelectedSectionId] = useState<string>(currentAssignment.section?.id?.toString() || '');
                const [selectedSubjectId, setSelectedSubjectId] = useState<string>(currentAssignment.subject?.id?.toString() || '');

                useEffect(() => {
                    reassignData.schoolYearId = selectedYearId;
                    reassignData.sectionId = selectedSectionId;
                    reassignData.subjectId = selectedSubjectId;
                }, [selectedYearId, selectedSectionId, selectedSubjectId]);

                useEffect(() => {
                    const loadSections = async () => {
                        if (!selectedYearId) {
                            setSections([]);
                            setSelectedSectionId('');
                            return;
                        }

                        setLoadingSections(true);
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
                            setSections(items);
                            if (selectedYearId !== (currentAssignment.school_year_id?.toString() || '')) {
                                setSelectedSectionId('');
                            }
                        } catch (error) {
                            console.error('Erreur chargement sections:', error);
                            setSections([]);
                        } finally {
                            setLoadingSections(false);
                        }
                    };

                    loadSections();
                }, [selectedYearId]);

                useEffect(() => {
                    const loadSubjects = async () => {
                        if (!selectedSectionId || !selectedYearId) {
                            setSubjects([]);
                            setSelectedSubjectId('');
                            return;
                        }

                        setLoadingSubjects(true);
                        try {
                            const res = await classroomService.getSubjects(parseInt(selectedSectionId), parseInt(selectedYearId));
                            let items: any[] = [];
                            if (res && res.success) {
                                // Le contrôleur retourne les données dans res.data[0]
                                const responseData = Array.isArray(res.data) ? res.data[0] : res.data;
                                if (Array.isArray(responseData)) {
                                    items = responseData;
                                } else if (responseData && Array.isArray(responseData.data)) {
                                    items = responseData.data;
                                }
                            }
                            console.log('Subjects loaded (reassign):', items); // Debug
                            setSubjects(items);
                            if (selectedSectionId !== currentAssignment.section?.id?.toString()) {
                                setSelectedSubjectId('');
                            }
                        } catch (error) {
                            console.error('Erreur chargement matières:', error);
                            setSubjects([]);
                        } finally {
                            setLoadingSubjects(false);
                        }
                    };

                    loadSubjects();
                }, [selectedSectionId, selectedYearId]);

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
                                        .filter((year) => year && year.id)
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
                                Section (Classe) *
                            </label>
                            <select
                                value={selectedSectionId}
                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                disabled={!selectedYearId || loadingSections}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
                            >
                                <option value="">
                                    {loadingSections 
                                        ? 'Chargement des sections...' 
                                        : !selectedYearId 
                                            ? 'Sélectionnez d\'abord une année scolaire' 
                                            : sections.length === 0
                                                ? 'Aucune section disponible'
                                                : 'Sélectionnez une section'}
                                </option>
                                {sections && sections.length > 0 && sections.map((s: any, index: number) => (
                                    <option key={s.id || `section-${index}`} value={s.id}>
                                        {s.name || s.display_name} {s.classroom_template?.level ? `(${s.classroom_template.level})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Matière *
                            </label>
                            <select
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                disabled={!selectedSectionId || loadingSubjects}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
                            >
                                <option value="">
                                    {loadingSubjects 
                                        ? 'Chargement des matières...' 
                                        : !selectedSectionId 
                                            ? 'Sélectionnez d\'abord une section' 
                                            : subjects.length === 0
                                                ? 'Aucune matière disponible pour cette section'
                                                : 'Sélectionnez une matière'}
                                </option>
                                {subjects && subjects.length > 0 && subjects.map((subj: any, index: number) => {
                                    // Les données viennent de SectionSubject avec relation subject
                                    const subjectId = subj.subject_id || subj.subject?.id || subj.id;
                                    const subjectName = subj.subject?.name || subj.name;
                                    const coefficient = subj.coefficient;
                                    
                                    return (
                                        <option key={subjectId || `subject-${index}`} value={subjectId}>
                                            {subjectName} {coefficient ? `(Coef: ${coefficient})` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                );
            };

            openModal({
                title: "Réaffecter l'enseignant",
                description: `Modifiez l'année scolaire, la section ou la matière pour ${teacher?.first_name} ${teacher?.last_name}. Si vous changez d'année scolaire, une nouvelle affectation sera créée.`,
                variant: "info",
                content: <ReassignModalContent years={yearsList} currentAssignment={assignment} />,
                primaryLabel: "Réaffecter",
                primaryAction: async () => {
                    if (!reassignData.schoolYearId || !reassignData.sectionId || !reassignData.subjectId) {
                        openModal({
                            title: "Erreur",
                            description: "Veuillez sélectionner une année scolaire, une section et une matière.",
                            variant: "error",
                        });
                        return;
                    }

                    try {
                        await teacherDetailService.reassignSectionSubject(
                            parseInt(id!),
                            assignment.id,
                            parseInt(reassignData.sectionId),
                            parseInt(reassignData.subjectId),
                            parseInt(reassignData.schoolYearId)
                        );
                        openModal({
                            title: "Succès",
                            description: "L'enseignant a été réaffecté avec succès.",
                            variant: "success",
                        });
                        loadTeacherData();
                    } catch (e: any) {
                        console.error('Erreur réaffectation enseignant:', e);
                        const errorMessage = e?.response?.data?.message || "Impossible de réaffecter l'enseignant. Veuillez réessayer.";
                        openModal({
                            title: "Erreur",
                            description: errorMessage,
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

    const handleRemoveAssignment = async (assignmentId: number) => {
        openModal({
            title: "Confirmer la suppression",
            description: "Êtes-vous sûr de vouloir retirer cette affectation ?",
            variant: "warning",
            primaryLabel: "Supprimer",
            primaryAction: async () => {
                try {
                    await teacherDetailService.removeAssignment(parseInt(id!), assignmentId);
                    openModal({
                        title: "Succès",
                        description: "L'affectation a été retirée avec succès.",
                        variant: "success",
                    });
                    loadTeacherData();
                } catch (e: any) {
                    console.error('Erreur suppression affectation:', e);
                    const errorMessage = e?.response?.data?.message || "Impossible de retirer l'affectation. Veuillez réessayer.";
                    openModal({
                        title: "Erreur",
                        description: errorMessage,
                        variant: "error",
                    });
                }
            },
        });
    };

    if (loading) {
        return <div className="p-6">Chargement...</div>;
    }

    if (!teacher) {
        return <div className="p-6">Enseignant non trouvé</div>;
    }

    // Flatten assignments for easier access
    const allAssignments = assignments.flatMap((yearGroup: any) => 
        yearGroup.assignments?.map((a: any) => ({
            ...a,
            school_year_id: yearGroup.school_year_id,
            school_year: yearGroup.school_year,
        })) || []
    );

    // Get unique sections and subjects
    const uniqueSections = Array.from(new Map(
        allAssignments
            .filter(a => a.section)
            .map(a => [a.section.id, a.section])
    ).values());

    const uniqueSubjects = Array.from(new Map(
        allAssignments
            .filter(a => a.subject)
            .map(a => [a.subject.id, a.subject])
    ).values());

    return (
        <div className="p-6">
            <PageMeta title={`${teacher.first_name} ${teacher.last_name}`} description={`Détails de l'enseignant ${teacher.first_name} ${teacher.last_name}`} />
            <PageBreadcrumb pageTitle={`${teacher.first_name} ${teacher.last_name}`} />

            {/* En-tête enseignant */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center text-3xl font-bold text-brand-600">
                        {teacher.first_name[0]}{teacher.last_name[0]}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{teacher.first_name} {teacher.last_name}</h1>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Spécialisation:</span>
                                <p className="font-semibold">{teacher.specialization || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Téléphone:</span>
                                <p className="font-semibold">{teacher.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Email:</span>
                                <p className="font-semibold">{teacher.email || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Date de naissance:</span>
                                <p className="font-semibold">{teacher.birth_date || 'N/A'}</p>
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
                            { key: 'subjects', label: 'Matières' },
                            { key: 'sections', label: 'Sections' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-brand-500 text-brand-600'
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
                                    <p className="font-medium">{teacher.first_name} {teacher.last_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Spécialisation</label>
                                    <p className="font-medium">{teacher.specialization || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Téléphone</label>
                                    <p className="font-medium">{teacher.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Email</label>
                                    <p className="font-medium">{teacher.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Date de naissance</label>
                                    <p className="font-medium">{teacher.birth_date || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Date d'embauche</label>
                                    <p className="font-medium">
                                        {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'years' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Parcours d'enseignement - Historique complet</h3>
                                <button
                                    onClick={handleAssignSectionSubject}
                                    className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {assignments.length === 0 ? 'Ajouter une affectation' : 'Ajouter une nouvelle année'}
                                </button>
                            </div>
                            {assignments.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-gray-500 mb-2">Aucune affectation trouvée.</p>
                                    <p className="text-sm text-gray-400 mb-4">Cet enseignant n'a aucune affectation pour le moment.</p>
                                    <button
                                        onClick={handleAssignSectionSubject}
                                        className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-colors inline-flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Ajouter une affectation
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Timeline verticale */}
                                    <div className="relative">
                                        {assignments.map((yearGroup: any, index: number) => {
                                            const isSelected = selectedYear === yearGroup.school_year_id;
                                            const startDate = yearGroup.school_year?.start_date 
                                                ? new Date(yearGroup.school_year.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
                                                : '';
                                            const endDate = yearGroup.school_year?.end_date 
                                                ? new Date(yearGroup.school_year.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
                                                : '';
                                            
                                            return (
                                                <div key={yearGroup.school_year_id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                                    {/* Ligne verticale */}
                                                    {index < assignments.length - 1 && (
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
                                                        onClick={() => setSelectedYear(isSelected ? null : yearGroup.school_year_id)}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`font-semibold ${
                                                                    isSelected 
                                                                        ? 'text-warning-700 dark:text-warning-400' 
                                                                        : 'text-gray-800 dark:text-white'
                                                                }`}>
                                                                    {yearGroup.school_year?.label || "Année inconnue"}
                                                                </h4>
                                                                {yearGroup.school_year?.is_active && (
                                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                            {(startDate || endDate) && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    {startDate} - {endDate}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Liste des affectations */}
                                                        {yearGroup.assignments && yearGroup.assignments.length > 0 ? (
                                                            <div className="mt-3 space-y-2">
                                                                {yearGroup.assignments.map((assignment: any) => (
                                                                    <div 
                                                                        key={assignment.id} 
                                                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 hover:shadow-sm transition-shadow"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                                </svg>
                                                                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                                                    {assignment.section?.name || assignment.section?.display_name || 'Section inconnue'}
                                                                                </span>
                                                                                {assignment.section?.classroom_template?.level && (
                                                                                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                                                                        {assignment.section.classroom_template.level}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-gray-400">•</div>
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                                </svg>
                                                                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                                                    {assignment.subject?.name || 'Matière inconnue'}
                                                                                </span>
                                                                                {assignment.coefficient && (
                                                                                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                                                                        Coef: {assignment.coefficient}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 ml-4">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleReassignSectionSubject(assignment);
                                                                                }}
                                                                                className="px-3 py-1 text-xs font-medium text-warning-700 bg-warning-100 hover:bg-warning-200 rounded-lg transition-colors dark:text-warning-400 dark:bg-warning-900/30 dark:hover:bg-warning-900/50"
                                                                                title="Réaffecter à une autre section/matière"
                                                                            >
                                                                                Réaffecter
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemoveAssignment(assignment.id);
                                                                                }}
                                                                                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                                                                                title="Retirer cette affectation"
                                                                            >
                                                                                Retirer
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                    Aucune affectation enregistrée pour cette année scolaire.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'subjects' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Matières enseignées</h3>
                                <button
                                    onClick={handleAssignSectionSubject}
                                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Ajouter une affectation
                                </button>
                            </div>
                            {uniqueSubjects.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 mb-2">Aucune matière assignée.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {uniqueSubjects.map((subject: any) => (
                                        <div key={subject.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                            <h4 className="font-semibold text-gray-800 dark:text-white">{subject.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">Code: {subject.code || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'sections' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Sections (Classes) enseignées</h3>
                                <button
                                    onClick={handleAssignSectionSubject}
                                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Ajouter une affectation
                                </button>
                            </div>
                            {uniqueSections.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 mb-2">Aucune section assignée.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {uniqueSections.map((section: any) => (
                                        <div key={section.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                            <h4 className="font-semibold text-gray-800 dark:text-white">{section.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {section.classroom_template?.level || ''} - {section.code || 'N/A'}
                                            </p>
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

