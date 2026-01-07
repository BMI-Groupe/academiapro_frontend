import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useCustomModal } from "../../context/ModalContext";
import assignmentService from "../../api/services/assignmentService";
import DatePicker from "../../components/form/date-picker";
import classroomService from "../../api/services/classroomService";
import schoolYearService from "../../api/services/schoolYearService";
import subjectService from "../../api/services/subjectService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";

export default function AssignmentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    passing_score: "10",
    total_score: "20",
    start_date: "",
    due_date: "",
    classroom_id: "",
    subject_id: "",
    school_year_id: "",
    period: "",
    apply_to_all_sections: false,
    apply_to_all_subjects: false,
  });

  const assignmentId = searchParams.get("id");
  const isEdit = !!assignmentId;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !form.school_year_id) {
      setForm(prev => ({ ...prev, school_year_id: activeSchoolYear.id.toString() }));
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (form.school_year_id) {
      loadClassrooms();
    }
  }, [form.school_year_id]);

  useEffect(() => {
    if (form.school_year_id) {
      if (form.apply_to_all_sections) {
        // Charger toutes les matières de l'année scolaire
        loadAllSubjects(form.school_year_id);
      } else if (form.classroom_id) {
        // Charger les matières de la classe spécifique
        loadSubjects(form.classroom_id, form.school_year_id);
      } else {
        setSubjects([]);
      }
    } else {
      setSubjects([]);
    }
  }, [form.school_year_id, form.classroom_id, form.apply_to_all_sections]);

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadData = async () => {
    try {
      const yearRes = await schoolYearService.list();

      if (yearRes?.success) {
        let items: any[] = [];
        if (Array.isArray(yearRes.data)) {
          if (yearRes.data[0] && Array.isArray(yearRes.data[0].data)) {
            items = yearRes.data[0].data;
          } else if (yearRes.data[0] && Array.isArray(yearRes.data[0])) {
            items = yearRes.data[0];
          } else {
            items = yearRes.data as any[];
          }
        } else if (yearRes.data && Array.isArray(yearRes.data.data)) {
          items = yearRes.data.data;
        }
        console.log("School Years loaded:", items);
        setSchoolYears(items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadClassrooms = async () => {
    try {
      const res = await classroomService.list({ school_year_id: form.school_year_id });
      console.log("Classrooms API response:", res);
      
      if (res?.success) {
        let items: any[] = [];
        
        // Handle direct array response
        if (Array.isArray(res.data)) {
          // Check if first element has a 'data' property (nested structure)
          if (res.data[0] && res.data[0].data && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } 
          // Check if first element is itself an array
          else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          }
          // Otherwise treat the whole array as items
          else {
            items = res.data;
          }
        } 
        // Handle nested data property
        else if (res.data && typeof res.data === 'object') {
          if (Array.isArray(res.data.data)) {
            items = res.data.data;
          } else if (res.data.classrooms && Array.isArray(res.data.classrooms)) {
            items = res.data.classrooms;
          }
        }
        
        console.log("Classrooms extracted:", items);
        setClassrooms(items || []);
      }
    } catch (e) {
      console.error("Error loading classrooms:", e);
    }
  };

  const loadSubjects = async (classroomId?: string, schoolYearId?: string) => {
    try {
      const classroomIdToUse = classroomId || form.classroom_id;
      const schoolYearIdToUse = schoolYearId || form.school_year_id;
      
      if (!classroomIdToUse || !schoolYearIdToUse) {
        setSubjects([]);
        return;
      }

      const res = await classroomService.getSubjects(parseInt(classroomIdToUse), parseInt(schoolYearIdToUse));
      
      if (res?.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          } else {
            items = res.data as any[];
          }
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
        }
        
        // Extraire les matières depuis les SectionSubject
        const subjectsList = items.map((item: any) => ({
          id: item.subject_id || item.subject?.id || item.id,
          name: item.subject?.name || item.name,
          code: item.subject?.code || item.code,
          coefficient: item.coefficient,
        })).filter((s: any) => s.id); // Filtrer les entrées invalides
        
        setSubjects(subjectsList);
      }
    } catch (e) {
      console.error("Error loading subjects:", e);
      setSubjects([]);
    }
  };

  const loadAllSubjects = async (schoolYearId?: string) => {
    try {
      const schoolYearIdToUse = schoolYearId || form.school_year_id;
      
      if (!schoolYearIdToUse) {
        setSubjects([]);
        return;
      }

      // Charger toutes les matières de l'année scolaire
      const res = await subjectService.list({ school_year_id: parseInt(schoolYearIdToUse) });
      
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
        
        const subjectsList = items.map((subject: any) => ({
          id: subject.id,
          name: subject.name,
          code: subject.code,
          coefficient: null, // Pas de coefficient spécifique quand toutes les classes
        })).filter((s: any) => s.id);
        
        setSubjects(subjectsList);
      }
    } catch (e) {
      console.error("Error loading all subjects:", e);
      setSubjects([]);
    }
  };



  const loadAssignment = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.get(parseInt(assignmentId!));
      console.log('Assignment API response:', res);
      
      if (res?.success) {
        // Handle nested data structure (data might be in res.data[0] or res.data)
        const assignment = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log('Assignment data:', assignment);
        
        const sectionId = assignment.section_id?.toString() || assignment.classroom_id?.toString() || "";
        const schoolYearId = assignment.school_year_id?.toString() || "";
        
        const formData = {
          title: assignment.title || "",
          description: assignment.description || "",
          type: assignment.type || "",
          passing_score: assignment.passing_score?.toString() || "10",
          total_score: assignment.total_score?.toString() || "20",
          start_date: assignment.start_date || "",
          due_date: assignment.due_date || "",
          classroom_id: sectionId,
          subject_id: assignment.subject_id?.toString() || "",
          school_year_id: schoolYearId,
          period: assignment.period?.toString() || "",
          apply_to_all_sections: false, // En mode update, on ne peut pas avoir "toutes les sections"
          apply_to_all_subjects: !assignment.subject_id,
        };
        
        console.log('Setting form data:', formData);
        setForm(formData);
        
        // Charger les classes et matières pour l'année scolaire
        if (schoolYearId) {
          await loadClassrooms();
          
          // Charger les matières si on a une section
          if (sectionId) {
            await loadSubjects(sectionId, schoolYearId);
          } else if (formData.apply_to_all_subjects) {
            // Si pas de matière spécifique, charger toutes les matières
            await loadAllSubjects(schoolYearId);
          }
        }
      }
    } catch (e) {
      console.error('Error loading assignment:', e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger les détails de l'examen/devoir.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.due_date || !form.type) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir tous les champs obligatoires (titre, type, date d'échéance).",
        variant: "error",
      });
      return;
    }

    if (!form.apply_to_all_sections && !form.classroom_id) {
      openModal({
        title: "Validation",
        description: "Veuillez sélectionner une classe ou cocher 'Toutes les classes'.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        type: form.type,
        max_score: parseFloat(form.total_score), // Use total_score as max_score for compatibility
        passing_score: parseFloat(form.passing_score),
        total_score: parseFloat(form.total_score),
        start_date: form.start_date || null,
        due_date: form.due_date,
        section_id: form.apply_to_all_sections ? null : parseInt(form.classroom_id), // Send section_id (classroom_id is the section ID)
        classroom_id: form.apply_to_all_sections ? null : parseInt(form.classroom_id), // Keep for compatibility
        subject_id: form.apply_to_all_subjects ? null : (form.subject_id ? parseInt(form.subject_id) : null),
        school_year_id: parseInt(form.school_year_id),
        period: form.period ? parseInt(form.period) : null,
        apply_to_all_sections: form.apply_to_all_sections,
        apply_to_all_subjects: form.apply_to_all_subjects,
      };

      if (isEdit) {
        await assignmentService.update(parseInt(assignmentId!), payload);
        openModal({
          title: "Succès",
          description: "Examen/Devoir mis à jour avec succès.",
          variant: "success",
        });
      } else {
        await assignmentService.create(payload);
        openModal({
          title: "Succès",
          description: "Examen/Devoir créé avec succès.",
          variant: "success",
        });
      }

      navigate("/assignments");
    } catch (e: any) {
      console.error("Error submitting assignment:", e);
      console.error("Error response:", e.response?.data);
      
      const errorMessage = e.response?.data?.message || e.response?.data?.data || "Une erreur s'est produite lors de l'opération.";
      
      openModal({
        title: "Erreur",
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title={isEdit ? "Modifier l'examen" : "Créer un examen"} description="Formulaire d'examen/devoir" />
      <PageBreadcrumb pageTitle={isEdit ? "Modifier l'examen" : "Créer un examen"} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label>Année scolaire *</Label>
              <select
                value={form.school_year_id}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setForm({ ...form, school_year_id: newVal, classroom_id: "", subject_id: "" });
                  if (newVal) {
                    loadClassrooms();
                  } else {
                    setClassrooms([]);
                    setSubjects([]);
                  }
                }}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Sélectionner une année scolaire</option>
                {schoolYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Période *</Label>
              <select
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Sélectionner une période</option>
                <optgroup label="Trimestres">
                  <option value="1">Trimestre 1</option>
                  <option value="2">Trimestre 2</option>
                  <option value="3">Trimestre 3</option>
                </optgroup>
                <optgroup label="Semestres">
                  <option value="1">Semestre 1</option>
                  <option value="2">Semestre 2</option>
                </optgroup>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Titre *</Label>
              <Input
                type="text"
                placeholder="Ex: Devoir de Mathématiques 1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                placeholder="Description de l'examen/devoir..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Type d'évaluation *</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="Devoir">Devoir</option>
                <option value="Examen">Examen</option>
                <option value="Composition">Composition</option>
                <option value="Interrogation">Interrogation</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <Label>Moyenne requise pour être admis *</Label>
              <Input
                type="number"
                step={0.5}
                placeholder="10"
                value={form.passing_score}
                onChange={(e) => setForm({ ...form, passing_score: e.target.value })}
              />
            </div>

            <div>
              <Label>Sur combien est la moyenne *</Label>
              <Input
                type="number"
                step={0.5}
                placeholder="20"
                value={form.total_score}
                onChange={(e) => setForm({ ...form, total_score: e.target.value })}
              />
            </div>

            <div>
              <Label>Classe</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="apply_to_all_sections"
                    checked={form.apply_to_all_sections}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm({ 
                        ...form, 
                        apply_to_all_sections: checked, 
                        classroom_id: checked ? "" : form.classroom_id,
                        // Ne pas réinitialiser subject_id, permettre de garder la sélection
                      });
                      // Les matières seront rechargées automatiquement via useEffect
                    }}
                    disabled={!form.school_year_id || isEdit}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Label htmlFor="apply_to_all_sections" className={`cursor-pointer font-normal ${isEdit ? 'opacity-50' : ''}`}>
                    Toutes les classes
                  </Label>
                </div>
                <select
                  value={form.classroom_id}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setForm({ ...form, classroom_id: newVal, subject_id: "", apply_to_all_sections: false });
                    if (newVal && form.school_year_id) {
                      loadSubjects(newVal, form.school_year_id);
                    } else {
                      setSubjects([]);
                    }
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                  disabled={!form.school_year_id || form.apply_to_all_sections}
                >
                  <option value="">Sélectionner une classe spécifique</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name || classroom.display_name} ({classroom.code})
                    </option>
                  ))}
                </select>
              </div>
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
              )}
              {form.apply_to_all_sections && !isEdit && (
                <p className="text-xs text-warning-600 mt-1">L'examen sera créé pour toutes les classes de l'année scolaire</p>
              )}
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">En mode édition, vous ne pouvez modifier que la classe spécifique de cet examen</p>
              )}
            </div>

            <div>
              <Label>Matière</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="apply_to_all_subjects"
                    checked={form.apply_to_all_subjects}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm({ 
                        ...form, 
                        apply_to_all_subjects: checked, 
                        subject_id: checked ? "" : form.subject_id
                      });
                    }}
                    disabled={!form.school_year_id}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <Label htmlFor="apply_to_all_subjects" className="cursor-pointer font-normal">
                    Toutes les matières
                  </Label>
                </div>
                <select
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value, apply_to_all_subjects: false })}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                  disabled={!form.school_year_id || form.apply_to_all_subjects}
                >
                  <option value="">Sélectionner une matière spécifique</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code}) {subject.coefficient ? `- Coef: ${subject.coefficient}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
              )}
              {form.apply_to_all_subjects && (
                <p className="text-xs text-warning-600 mt-1">L'examen s'appliquera à toutes les matières</p>
              )}
            </div>

            <div>
              <DatePicker
                id="start_date"
                label="Date de début *"
                placeholder="Sélectionner une date"
                defaultDate={form.start_date}
                onChange={(dates, dateStr) => setForm({ ...form, start_date: dateStr })}
              />
            </div>

            <div>
              <DatePicker
                id="due_date"
                label="Date d'échéance *"
                placeholder="Sélectionner une date"
                defaultDate={form.due_date}
                onChange={(dates, dateStr) => setForm({ ...form, due_date: dateStr })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/assignments")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
