import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useCustomModal } from "../../context/ModalContext";
import gradeService from "../../api/services/gradeService";
import studentService from "../../api/services/studentService";
import assignmentService from "../../api/services/assignmentService";
import subjectService from "../../api/services/subjectService";
import schoolYearService from "../../api/services/schoolYearService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import { useMemo } from "react";
import SearchableSelect from "../../components/form/SearchableSelect";

export default function GradeFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_id: "",
    subject_id: "",
    assignment_id: "",
    school_year_id: "",
    score: "",
    notes: "",
  });

  const gradeId = searchParams.get("id");
  const isEdit = !!gradeId;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !form.school_year_id) {
      const yearId = activeSchoolYear.id.toString();
      setForm(prev => ({ ...prev, school_year_id: yearId }));
      loadAssignments(yearId);
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (gradeId) {
      loadGrade();
    }
  }, [gradeId]);

  // Filter assignments client-side based on selected subject
  const filteredAssignments = useMemo(() => {
    if (!form.subject_id) {
      return assignments; // Show all if no subject selected
    }
    return assignments.filter(a => !a.subject_id || a.subject_id.toString() === form.subject_id);
  }, [assignments, form.subject_id]);

  const loadData = async () => {
    try {
      const [studentRes, subjectRes, yearRes] = await Promise.all([
        studentService.list(),
        subjectService.list(),
        schoolYearService.list(),
      ]);

      if (studentRes?.success) {
        let items: any[] = [];
        if (Array.isArray(studentRes.data)) {
          if (studentRes.data[0] && Array.isArray(studentRes.data[0].data)) {
            items = studentRes.data[0].data;
          } else if (studentRes.data[0] && Array.isArray(studentRes.data[0])) {
            items = studentRes.data[0];
          } else {
            items = studentRes.data as any[];
          }
        } else if (studentRes.data && Array.isArray(studentRes.data.data)) {
          items = studentRes.data.data;
        }
        setStudents(items || []);
      }

      if (subjectRes?.success) {
        let items: any[] = [];
        if (Array.isArray(subjectRes.data)) {
          if (subjectRes.data[0] && Array.isArray(subjectRes.data[0].data)) {
            items = subjectRes.data[0].data;
          } else if (subjectRes.data[0] && Array.isArray(subjectRes.data[0])) {
            items = subjectRes.data[0];
          } else {
            items = subjectRes.data as any[];
          }
        } else if (subjectRes.data && Array.isArray(subjectRes.data.data)) {
          items = subjectRes.data.data;
        }
        setSubjects(items || []);
      }

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
        setSchoolYears(items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAssignments = async (schoolYearId?: string) => {
    try {
      // Load all assignments for the school year (no subject filter)
      const idToUse = schoolYearId || form.school_year_id;
      if (!idToUse) return;

      const params: any = { school_year_id: idToUse };
      
      console.log("Loading assignments with params:", params);
      
      const res = await assignmentService.list(params);
      console.log("Assignments API response:", res);
      
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
        console.log("Assignments extracted:", items);
        setAssignments(items || []);
      }
    } catch (e) {
      console.error("Error loading assignments:", e);
    }
  };


  const loadGrade = async () => {
    setLoading(true);
    try {
      const res = await gradeService.get(parseInt(gradeId!));
      console.log('Grade API response:', res);
      
      if (res?.success) {
        // Handle nested data structure
        const grade = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log('Grade data:', grade);
        
        const formData = {
          student_id: grade.student_id?.toString() || "",
          subject_id: grade.assignment?.subject_id?.toString() || "",
          assignment_id: grade.assignment_id?.toString() || "",
          school_year_id: grade.assignment?.school_year_id?.toString() || "",
          score: grade.score?.toString() || "",
          notes: grade.notes || "",
        };
        
        console.log('Setting form data:', formData);
        setForm(formData);
        
        // Load assignments for the school year
        if (grade.assignment?.school_year_id) {
          await loadAssignments(grade.assignment.school_year_id.toString());
        }
      }
    } catch (e) {
      console.error('Error loading grade:', e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger les détails de la note.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.student_id || !form.assignment_id || !form.score) {
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
        student_id: parseInt(form.student_id),
        assignment_id: parseInt(form.assignment_id),
        score: parseFloat(form.score),
        notes: form.notes,
        graded_at: new Date().toISOString(),
      };

      if (isEdit) {
        await gradeService.update(parseInt(gradeId!), payload);
        openModal({
          title: "Succès",
          description: "Note mise à jour avec succès.",
          variant: "success",
        });
      } else {
        await gradeService.create(payload);
        openModal({
          title: "Succès",
          description: "Note ajoutée avec succès.",
          variant: "success",
        });
      }

      navigate("/grades");
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'opération.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title={isEdit ? "Modifier la note" : "Ajouter une note"} description="Formulaire de note" />
      <PageBreadcrumb pageTitle={isEdit ? "Modifier la note" : "Ajouter une note"} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Année scolaire *</Label>
              <select
                value={form.school_year_id}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setForm({ ...form, school_year_id: newVal, assignment_id: "" });
                  if (newVal) {
                    loadAssignments(newVal);
                  } else {
                    setAssignments([]);
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

            <div>
              <Label>Élève *</Label>
              <SearchableSelect
                options={students.map((student) => ({
                  value: student.id.toString(),
                  label: `${student.first_name} ${student.last_name} (${student.matricule})`,
                }))}
                value={form.student_id}
                onChange={(value) => setForm({ ...form, student_id: value })}
                placeholder="Sélectionner un élève"
                searchPlaceholder="Rechercher un élève..."
                required
              />
            </div>

            <div>
              <Label>Matière (optionnel)</Label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">Toutes les matières</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Examen / Devoir *</Label>
              <select
                value={form.assignment_id}
                onChange={(e) => setForm({ ...form, assignment_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                required
                disabled={!form.school_year_id}
              >
                <option value="">Sélectionner un examen</option>
                {filteredAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title} - {assignment.type} - Max: {assignment.max_score}
                  </option>
                ))}
              </select>
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
              )}
            </div>

            <div>
              <Label>Note *</Label>
              <Input
                type="number"
                step={0.01}
                placeholder="15.5"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Commentaires</Label>
              <textarea
                placeholder="Ajouter des commentaires..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate("/grades")}>
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
