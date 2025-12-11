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
import { useActiveSchoolYear } from "../../context/SchoolYearContext";

export default function AssignmentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
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
    school_year_id: "",
    period: "",
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



  const loadAssignment = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.get(parseInt(assignmentId!));
      console.log('Assignment API response:', res);
      
      if (res?.success) {
        // Handle nested data structure (data might be in res.data[0] or res.data)
        const assignment = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log('Assignment data:', assignment);
        
        const formData = {
          title: assignment.title || "",
          description: assignment.description || "",
          type: assignment.type || "",
          passing_score: assignment.passing_score?.toString() || "10",
          total_score: assignment.total_score?.toString() || "20",
          start_date: assignment.start_date || "",
          due_date: assignment.due_date || "",
          classroom_id: assignment.classroom_id?.toString() || "",
          school_year_id: assignment.school_year_id?.toString() || "",
          period: assignment.period?.toString() || "",
        };
        
        console.log('Setting form data:', formData);
        setForm(formData);
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

    if (!form.title || !form.classroom_id || !form.due_date || !form.type) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        max_score: parseFloat(form.total_score), // Use total_score as max_score for compatibility
        passing_score: parseFloat(form.passing_score),
        total_score: parseFloat(form.total_score),
        start_date: form.start_date,
        due_date: form.due_date,
        classroom_id: parseInt(form.classroom_id),
        school_year_id: parseInt(form.school_year_id),
        period: parseInt(form.period),
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
                onChange={(e) => setForm({ ...form, school_year_id: e.target.value, classroom_id: "" })}
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

            <div>
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
              <Label>Classe *</Label>
              <select
                value={form.classroom_id}
                onChange={(e) => setForm({ ...form, classroom_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
                disabled={!form.school_year_id}
              >
                <option value="">Sélectionner une classe</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} ({classroom.code})
                  </option>
                ))}
              </select>
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
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
