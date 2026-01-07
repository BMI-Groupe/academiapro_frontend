import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import DataTable from '../../components/common/DataTable';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { useCustomModal } from '../../context/ModalContext';
import { useActiveSchoolYear } from '../../context/SchoolYearContext';
import classroomTemplateSubjectService from '../../api/services/classroomTemplateSubjectService';
import subjectService from '../../api/services/subjectService';
import classroomService from '../../api/services/classroomService';
import schoolYearService from '../../api/services/schoolYearService';
import ActiveSchoolYearAlert from '../../components/common/ActiveSchoolYearAlert';

export default function ClassroomTemplateSubjectsPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    subject_id: '',
    coefficient: '1',
    school_year_id: '',
  });

  useEffect(() => {
    // Vérifier si une année scolaire est passée en paramètre URL
    const yearIdFromUrl = searchParams.get('school_year_id');
    
    if (yearIdFromUrl && schoolYears.length > 0) {
      const year = schoolYears.find(y => y.id === parseInt(yearIdFromUrl));
      if (year) {
        setSelectedYear(year);
        setForm(prev => ({ ...prev, school_year_id: year.id.toString() }));
        return;
      }
    }
    
    // Sinon, utiliser l'année active
    if (activeSchoolYear) {
      setSelectedYear(activeSchoolYear);
      setForm(prev => ({ ...prev, school_year_id: activeSchoolYear.id.toString() }));
    }
  }, [activeSchoolYear, searchParams, schoolYears]);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
      loadSchoolYears();
      loadAllSubjects();
    }
  }, [templateId]);

  useEffect(() => {
    if (templateId && selectedYear) {
      loadSubjects();
      loadAllSubjects(); // Recharger les matières selon l'année sélectionnée
      setForm(prev => ({ ...prev, school_year_id: selectedYear.id.toString() }));
    }
  }, [templateId, selectedYear]);

  const loadTemplate = async () => {
    if (!templateId) return;
    
    try {
      // Récupérer le template depuis une section qui l'utilise
      const res = await classroomService.list();
      if (res?.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data;
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        
        const section = items.find((s: any) => s.classroom_template_id?.toString() === templateId);
        if (section?.classroom_template) {
          setTemplate(section.classroom_template);
        }
      }
    } catch (e) {
      console.error('Error loading template:', e);
    }
  };

  const loadSchoolYears = async () => {
    try {
      const res = await schoolYearService.list();
      if (res?.success) {
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
    } catch (e) {
      console.error('Error loading school years:', e);
    }
  };

  const loadAllSubjects = async () => {
    if (!selectedYear) {
      setAllSubjects([]);
      return;
    }
    
    try {
      const res = await subjectService.list({ school_year_id: selectedYear.id, per_page: 1000 });
      
      if (res && res.success && res.data) {
        let items: any[] = [];
        
        // Gérer la pagination
        if (res.data && typeof res.data === 'object' && 'data' in res.data) {
          // Format paginé
          items = Array.isArray(res.data.data) ? res.data.data : [];
        } else if (Array.isArray(res.data)) {
          // Format array direct
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data;
          }
        }
        
        // Filtrer UNIQUEMENT les matières de cette année scolaire spécifique
        // Exclure les matières globales (sans school_year_id)
        const filteredSubjects = items.filter((subject: any) => {
          const subjectYearId = subject.school_year_id;
          // Uniquement les matières avec school_year_id égal à l'année sélectionnée
          return subjectYearId === selectedYear.id;
        });
        
        setAllSubjects(filteredSubjects || []);
      } else {
        setAllSubjects([]);
      }
    } catch (e) {
      console.error('Error loading subjects:', e);
      setAllSubjects([]);
    }
  };

  const loadSubjects = async () => {
    if (!templateId || !selectedYear) return;
    
    setLoading(true);
    try {
      const res = await classroomTemplateSubjectService.getSubjects(parseInt(templateId), selectedYear.id);
      if (res && res.success && res.data) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data;
          }
        }
        // S'assurer que les données sont correctement structurées
        const formattedItems = items.map((item: any) => ({
          ...item,
          subject_id: item.subject_id || item.subject?.id,
          coefficient: item.coefficient || item.pivot?.coefficient,
        }));
        setSubjects(formattedItems || []);
      }
    } catch (e) {
      console.error('Error loading subjects:', e);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!form.subject_id || !form.coefficient || !templateId || !selectedYear) {
      openModal({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs et sélectionner une année scolaire.',
        variant: 'error',
      });
      return;
    }

    try {
      await classroomTemplateSubjectService.assignSubject(parseInt(templateId), {
        subject_id: parseInt(form.subject_id),
        coefficient: parseInt(form.coefficient),
        school_year_id: selectedYear.id,
      });

      openModal({
        title: 'Succès',
        description: 'Matière ajoutée au template. Les sections existantes de cette année ont été mises à jour.',
        variant: 'success',
      });

      setShowAddForm(false);
      setForm({ subject_id: '', coefficient: '1', school_year_id: selectedYear.id.toString() });
      await loadSubjects();
    } catch (e: any) {
      console.error(e);
      openModal({
        title: 'Erreur',
        description: e?.response?.data?.message || 'Impossible d\'ajouter la matière.',
        variant: 'error',
      });
    }
  };

  const handleEditCoefficient = (item: any) => {
    openModal({
      title: 'Modifier le coefficient',
      description: `Matière : ${item.subject?.name}`,
      variant: 'info',
      // @ts-ignore
      customContent: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="coefficient">Nouveau coefficient</Label>
            <Input
              id="coefficient"
              type="number"
              min="1"
              max="10"
              // @ts-ignore
              defaultValue={item.coefficient}
              onChange={(e) => {
                (window as any).newCoefficient = e.target.value;
              }}
            />
          </div>
        </div>
      ),
      primaryLabel: 'Modifier',
      primaryAction: async () => {
        const newCoef = (window as any).newCoefficient || item.coefficient;
        if (!selectedYear) {
          openModal({
            title: 'Erreur',
            description: 'Veuillez sélectionner une année scolaire.',
            variant: 'error',
          });
          return;
        }
        try {
          await classroomTemplateSubjectService.updateCoefficient(
            parseInt(templateId!),
            item.subject_id,
            {
              coefficient: parseInt(newCoef),
              school_year_id: selectedYear.id,
            }
          );

          openModal({
            title: 'Succès',
            description: 'Coefficient modifié. Les sections existantes de cette année ont été mises à jour.',
            variant: 'success',
          });

          await loadSubjects();
        } catch (e: any) {
          console.error(e);
          openModal({
            title: 'Erreur',
            description: e?.response?.data?.message || 'Impossible de modifier le coefficient.',
            variant: 'error',
          });
        }
      },
    });
  };

  const handleDelete = (item: any) => {
    openModal({
      title: 'Confirmer la suppression',
      description: `Êtes-vous sûr de vouloir retirer "${item.subject?.name}" du template ? Cette action ne supprimera pas la matière des sections existantes.`,
      variant: 'error',
      primaryLabel: 'Supprimer',
      primaryAction: async () => {
        if (!selectedYear) {
          openModal({
            title: 'Erreur',
            description: 'Veuillez sélectionner une année scolaire.',
            variant: 'error',
          });
          return;
        }
        try {
          await classroomTemplateSubjectService.removeSubject(
            parseInt(templateId!),
            item.subject_id,
            selectedYear.id
          );

          openModal({
            title: 'Succès',
            description: 'Matière retirée du template pour cette année scolaire.',
            variant: 'success',
          });

          await loadSubjects();
        } catch (e: any) {
          console.error(e);
          openModal({
            title: 'Erreur',
            description: e?.response?.data?.message || 'Impossible de retirer la matière.',
            variant: 'error',
          });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Matières du template" description="Gestion des matières et coefficients du template" />
      <PageBreadcrumb pageTitle={`Matières du template ${template?.name || ''}`} />

      <div className="space-y-6">
        <ActiveSchoolYearAlert />

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
              Matières du template : {template?.name || 'Chargement...'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les matières et leurs coefficients pour ce niveau par année scolaire. Les nouvelles sections hériteront automatiquement de ces matières.
            </p>
          </div>
          <Button onClick={() => navigate('/classrooms')}>← Retour</Button>
        </div>

        {/* Sélecteur d'année scolaire */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <Label htmlFor="schoolYear">Année scolaire *</Label>
          <select
            id="schoolYear"
            className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none"
            value={selectedYear?.id || ''}
            onChange={(e) => {
              const year = schoolYears.find(y => y.id === parseInt(e.target.value));
              setSelectedYear(year);
              setShowAddForm(false);
              // Réinitialiser le formulaire et recharger les matières
              setForm({ subject_id: '', coefficient: '1', school_year_id: year?.id.toString() || '' });
            }}
            required
          >
            <option value="">Sélectionner une année scolaire</option>
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label} {year.is_active ? '(Active)' : ''}
              </option>
            ))}
          </select>
          {!selectedYear && (
            <p className="text-xs text-gray-500 mt-1">Veuillez sélectionner une année scolaire pour gérer les matières</p>
          )}
        </div>

        {/* Info box */}
        {selectedYear && (
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-brand-900 dark:text-brand-100 mb-1">
                  Coefficient appliqué partout pour {selectedYear.label}
                </p>
                <p className="text-sm text-brand-700 dark:text-brand-300">
                  Les coefficients définis ici pour l'année scolaire <strong>{selectedYear.label}</strong> seront automatiquement appliqués à toutes les sections de ce niveau pour cette année et utilisés dans les calculs de moyennes et bulletins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {selectedYear && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={!selectedYear}
            >
              {showAddForm ? 'Annuler' : '+ Ajouter une matière'}
            </Button>
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showAddForm && selectedYear && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
              Ajouter une matière au template pour {selectedYear.label}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Matière *</Label>
                <select
                  id="subject"
                  className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none"
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  required
                >
                  <option value="">
                    {allSubjects.length === 0 
                      ? 'Aucune matière disponible pour cette année' 
                      : 'Sélectionner une matière...'}
                  </option>
                  {allSubjects
                    .filter(subject => !subjects.some(s => s.subject_id === subject.id))
                    .map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                        {!subject.school_year_id && ' - Toutes les années'}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label htmlFor="coefficient">Coefficient *</Label>
                <Input
                  id="coefficient"
                  type="number"
                  min="1"
                  max="10"
                  value={form.coefficient}
                  onChange={(e) => setForm({ ...form, coefficient: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddSubject}>Ajouter</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Table du programme */}
        {selectedYear ? (
          <DataTable
            columns={[
              { 
                key: 'subject', 
                label: 'Matière',
                render: (value: any, item: any) => (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white/90">
                      {item.subject?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Code: {item.subject?.code || 'N/A'}
                    </div>
                  </div>
                )
              },
              { 
                key: 'coefficient', 
                label: 'Coefficient',
                render: (value: any) => (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                    {value}
                  </span>
                )
              },
            ]}
            data={subjects}
            loading={loading}
            onEdit={handleEditCoefficient}
            onDelete={handleDelete}
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Sélectionnez une année scolaire</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Veuillez choisir une année scolaire pour afficher et gérer les matières du template.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

