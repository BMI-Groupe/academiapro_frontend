import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import DataTable from '../../components/common/DataTable';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import { useCustomModal } from '../../context/ModalContext';
import { useActiveSchoolYear } from '../../context/SchoolYearContext';
import classroomSubjectService from '../../api/services/classroomSubjectService';
import subjectService from '../../api/services/subjectService';
import schoolYearService from '../../api/services/schoolYearService';
import ActiveSchoolYearAlert from '../../components/common/ActiveSchoolYearAlert';

export default function ClassroomSubjectsPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { openModal, closeModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  
  const [program, setProgram] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    subject_id: '',
    coefficient: '1',
  });

  useEffect(() => {
    if (activeSchoolYear) {
      setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    loadSchoolYears();
    loadAllSubjects();
  }, []);

  useEffect(() => {
    if (selectedYear && classroomId) {
      loadProgram();
    }
  }, [selectedYear, classroomId]);

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
            items = res.data;
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }
        setSchoolYears(items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllSubjects = async () => {
    try {
      const res = await subjectService.list();
      if (res && res.success && res.data) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else {
            items = res.data;
          }
        }
        setAllSubjects(items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProgram = async () => {
    if (!classroomId || !selectedYear) return;
    
    setLoading(true);
    try {
      const res = await classroomSubjectService.getProgram(parseInt(classroomId), selectedYear.id);
      if (res && res.success && res.data) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data;
          }
        }
        setProgram(items || []);
      }
    } catch (e) {
      console.error(e);
      setProgram([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!form.subject_id || !form.coefficient) {
      openModal({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'error',
      });
      return;
    }

    try {
      await classroomSubjectService.assignSubject(parseInt(classroomId!), {
        subject_id: parseInt(form.subject_id),
        coefficient: parseInt(form.coefficient),
        school_year_id: selectedYear?.id,
      });

      openModal({
        title: 'Succès',
        description: 'Matière ajoutée avec succès.',
        variant: 'success',
      });

      setShowAddForm(false);
      setForm({ subject_id: '', coefficient: '1' });
      await loadProgram();
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
        try {
          await classroomSubjectService.updateCoefficient(
            parseInt(classroomId!),
            item.subject_id,
            {
              coefficient: parseInt(newCoef),
              school_year_id: selectedYear?.id,
            }
          );

          openModal({
            title: 'Succès',
            description: 'Coefficient modifié avec succès.',
            variant: 'success',
          });

          await loadProgram();
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
      description: `Êtes-vous sûr de vouloir retirer "${item.subject?.name}" du programme ?`,
      variant: 'error',
      primaryLabel: 'Supprimer',
      primaryAction: async () => {
        try {
          await classroomSubjectService.removeSubject(
            parseInt(classroomId!),
            item.subject_id,
            selectedYear?.id
          );

          openModal({
            title: 'Succès',
            description: 'Matière retirée avec succès.',
            variant: 'success',
          });

          await loadProgram();
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

  const handleCopyProgram = () => {
    openModal({
      title: 'Copier le programme',
      description: 'Copier le programme d\'une autre année vers l\'année sélectionnée',
      variant: 'info',
      // @ts-ignore
      customContent: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="fromYear">Depuis l'année</Label>
            <select
              id="fromYear"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              onChange={(e) => {
                (window as any).fromYearId = e.target.value;
              }}
            >
              <option value="">Sélectionner...</option>
              {schoolYears.filter(y => y.id !== selectedYear?.id).map(year => (
                <option key={year.id} value={year.id}>{year.label}</option>
              ))}
            </select>
          </div>
        </div>
      ),
      primaryLabel: 'Copier',
      primaryAction: async () => {
        const fromYearId = (window as any).fromYearId;
        if (!fromYearId || !selectedYear) {
          openModal({
            title: 'Erreur',
            description: 'Veuillez sélectionner une année source.',
            variant: 'error',
          });
          return;
        }

        try {
          const res = await classroomSubjectService.copyProgram(parseInt(classroomId!), {
            from_year_id: parseInt(fromYearId),
            to_year_id: selectedYear.id,
          });

          openModal({
            title: 'Succès',
            description: res.data?.count ? `${res.data.count} matière(s) copiée(s).` : 'Programme copié.',
            variant: 'success',
          });

          await loadProgram();
        } catch (e: any) {
          console.error(e);
          openModal({
            title: 'Erreur',
            description: e?.response?.data?.message || 'Impossible de copier le programme.',
            variant: 'error',
          });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Programme de la classe" description="Gestion des matières et coefficients" />
      <PageBreadcrumb pageTitle="Programme de la classe" />

      <div className="space-y-6">
        <ActiveSchoolYearAlert />

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
              Programme de la classe
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les matières et leurs coefficients par année scolaire
            </p>
          </div>
          <Button onClick={() => navigate('/classrooms')}>← Retour</Button>
        </div>

        {/* Sélecteur d'année */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <Label htmlFor="schoolYear">Année scolaire</Label>
          <select
            id="schoolYear"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
            value={selectedYear?.id || ''}
            onChange={(e) => {
              const year = schoolYears.find(y => y.id === parseInt(e.target.value));
              setSelectedYear(year);
            }}
          >
            {schoolYears.map((year, index) => (
              <option key={`${year.id}-${index}`} value={year.id}>
                {year.label} {year.is_active ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Annuler' : '+ Ajouter une matière'}
          </Button>
          {/* @ts-ignore */}
          <Button onClick={handleCopyProgram} variant="secondary">
            📋 Copier depuis une autre année
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-4">
            <h3 className="text-lg font-semibold">Ajouter une matière</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Matière</Label>
                <select
                  id="subject"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {allSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="coefficient">Coefficient</Label>
                <Input
                  id="coefficient"
                  type="number"
                  min="1"
                  max="10"
                  value={form.coefficient}
                  onChange={(e) => setForm({ ...form, coefficient: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddSubject}>Ajouter</Button>
          </div>
        )}

        {/* Table du programme */}
        <DataTable
          columns={[
            { key: 'subject.name', label: 'Matière' },
            { key: 'subject.code', label: 'Code' },
            { key: 'coefficient', label: 'Coefficient' },
          ]}
          data={program}
          loading={loading}
          onEdit={handleEditCoefficient}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
