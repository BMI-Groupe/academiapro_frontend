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
import classroomService from "../../api/services/classroomService";
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
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_id: "",
    classroom_id: "",
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
      loadClassrooms(yearId);
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    // Don't auto-load if we're in edit mode and loading grade data
    if (isEdit && gradeId) {
      return;
    }
    
    if (form.school_year_id) {
      loadClassrooms(form.school_year_id);
      loadAssignments(form.school_year_id);
    } else {
      setAssignments([]);
    }
  }, [form.school_year_id, isEdit, gradeId]);

  useEffect(() => {
    // Don't auto-load if we're in edit mode and loading grade data
    if (isEdit && gradeId) {
      return;
    }
    
    if (form.school_year_id && form.classroom_id) {
      loadSubjects(form.classroom_id, form.school_year_id);
      loadStudents(form.school_year_id, form.classroom_id);
    } else if (form.school_year_id) {
      loadStudents(form.school_year_id);
      setSubjects([]);
    } else {
      setSubjects([]);
      setStudents([]);
    }
  }, [form.school_year_id, form.classroom_id, isEdit, gradeId]);

  useEffect(() => {
    if (gradeId) {
      loadGrade();
    }
  }, [gradeId]);
  
  useEffect(() => {
    // When assignment changes, auto-select the subject if assignment has a specific subject
    if (form.assignment_id && assignments.length > 0) {
      const selectedAssignment = assignments.find(a => a.id.toString() === form.assignment_id);
      if (selectedAssignment?.subject_id) {
        // Auto-select the subject if assignment is linked to a specific subject
        setForm(prev => ({ ...prev, subject_id: selectedAssignment.subject_id.toString() }));
      } else {
        // If assignment applies to all subjects, clear the subject selection to let user choose
        // Don't clear if user has already selected a subject
        if (!form.subject_id) {
          setForm(prev => ({ ...prev, subject_id: "" }));
        }
      }
    }
  }, [form.assignment_id, assignments]);

  // Filter subjects based on selected assignment
  // If an assignment is selected, only show subjects that match that assignment
  const filteredSubjects = useMemo(() => {
    if (!form.assignment_id) {
      return subjects; // Show all subjects if no assignment selected
    }
    const selectedAssignment = assignments.find(a => a.id.toString() === form.assignment_id);
    if (!selectedAssignment) {
      return subjects;
    }
    // If assignment has a specific subject, only show that subject
    if (selectedAssignment.subject_id) {
      return subjects.filter(s => s.id.toString() === selectedAssignment.subject_id.toString());
    }
    // If assignment applies to all subjects, show all subjects
    return subjects;
  }, [subjects, assignments, form.assignment_id]);

  const loadData = async () => {
    try {
      const [yearRes] = await Promise.all([
        schoolYearService.list(),
      ]);

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

  const loadStudents = async (schoolYearId?: string, classroomId?: string) => {
    try {
      const idToUse = schoolYearId || form.school_year_id;
      if (!idToUse) {
        setStudents([]);
        return;
      }

      const params: any = { school_year_id: parseInt(idToUse) };
      
      // Si une classe est sélectionnée, filtrer aussi par classe
      if (classroomId || form.classroom_id) {
        params.section_id = parseInt(classroomId || form.classroom_id);
      }

      const studentRes = await studentService.list(params);
      
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
    } catch (e) {
      console.error("Error loading students:", e);
      setStudents([]);
    }
  };

  const loadClassrooms = async (schoolYearId?: string) => {
    try {
      const idToUse = schoolYearId || form.school_year_id;
      if (!idToUse) {
        setClassrooms([]);
        return;
      }

      const res = await classroomService.list({ school_year_id: parseInt(idToUse) });
      
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
        setClassrooms(items || []);
      }
    } catch (e) {
      console.error("Error loading classrooms:", e);
      setClassrooms([]);
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

  const loadAssignments = async (schoolYearId?: string) => {
    try {
      // Load all assignments for the school year (no subject filter)
      const idToUse = schoolYearId || form.school_year_id;
      if (!idToUse) return [];

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
        return items || [];
      }
      return [];
    } catch (e) {
      console.error("Error loading assignments:", e);
      return [];
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
        console.log('Grade assignment:', grade.assignment);
        
        // Extract all necessary IDs from the grade and assignment
        const sectionId = grade.assignment?.section_id?.toString() || grade.assignment?.classroom_id?.toString() || "";
        const yearId = grade.assignment?.school_year_id?.toString() || "";
        const assignmentId = grade.assignment_id?.toString() || "";
        const studentId = grade.student_id?.toString() || "";
        const subjectId = grade.assignment?.subject_id?.toString() || "";
        
        // Load all necessary data FIRST before setting form values
        let loadedAssignments: any[] = [];
        if (yearId) {
          // Load assignments, classrooms, and students in parallel
          const [assignmentsResult] = await Promise.all([
            loadAssignments(yearId),
            loadClassrooms(yearId),
            loadStudents(yearId, sectionId), // Load students for the year and optionally the classroom
          ]);
          loadedAssignments = assignmentsResult || [];
          
          // If the assignment from the grade is not in the loaded list, add it manually
          if (grade.assignment && assignmentId) {
            const assignmentExists = loadedAssignments.find(a => 
              (a.id?.toString() === assignmentId) || (a.id === parseInt(assignmentId))
            );
            if (!assignmentExists) {
              console.log('Assignment not found in list, adding it manually:', grade.assignment);
              // Add the assignment from the grade to the assignments list
              const assignmentToAdd = {
                id: grade.assignment.id,
                title: grade.assignment.title || '',
                type: grade.assignment.type || '',
                max_score: grade.assignment.max_score || grade.assignment.total_score || '',
                total_score: grade.assignment.total_score || grade.assignment.max_score || '',
                subject_id: grade.assignment.subject_id,
                section_id: grade.assignment.section_id,
                school_year_id: grade.assignment.school_year_id,
              };
              loadedAssignments.push(assignmentToAdd);
              setAssignments(prev => {
                // Check if it's already there to avoid duplicates
                if (!prev.find(a => (a.id?.toString() === assignmentId) || (a.id === parseInt(assignmentId)))) {
                  return [...prev, assignmentToAdd];
                }
                return prev;
              });
            }
          }
          
          // Load subjects if we have a section/classroom
          if (sectionId) {
            await loadSubjects(sectionId, yearId);
            // Also ensure students are loaded for this specific classroom
            await loadStudents(yearId, sectionId);
          }
        }
        
        // Now set all form fields after data is loaded
        const formData = {
          student_id: studentId,
          classroom_id: sectionId,
          subject_id: subjectId,
          assignment_id: assignmentId,
          school_year_id: yearId,
          score: grade.score?.toString() || "",
          notes: grade.notes || "",
        };
        
        console.log('Setting form data after loading lists:', formData);
        setForm(formData);
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
                  setForm({ ...form, school_year_id: newVal, classroom_id: "", assignment_id: "", subject_id: "", student_id: "" });
                  if (newVal) {
                    loadAssignments(newVal);
                    loadClassrooms(newVal);
                    loadStudents(newVal);
                  } else {
                    setAssignments([]);
                    setClassrooms([]);
                    setSubjects([]);
                    setStudents([]);
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
              <Label>Classe *</Label>
              <select
                value={form.classroom_id}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setForm({ ...form, classroom_id: newVal, subject_id: "", assignment_id: "", student_id: "" });
                  if (newVal && form.school_year_id) {
                    loadSubjects(newVal, form.school_year_id);
                    loadStudents(form.school_year_id, newVal);
                  } else {
                    setSubjects([]);
                    if (form.school_year_id) {
                      loadStudents(form.school_year_id);
                    } else {
                      setStudents([]);
                    }
                  }
                }}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                disabled={!form.school_year_id}
                required
              >
                <option value="">Sélectionner une classe</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name || classroom.display_name} ({classroom.code})
                  </option>
                ))}
              </select>
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Examen / Devoir *</Label>
              <select
                value={form.assignment_id}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setForm({ ...form, assignment_id: newVal, subject_id: "" });
                }}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                required
                disabled={!form.school_year_id}
              >
                <option value="">
                  {!form.school_year_id 
                    ? 'Sélectionnez d\'abord une année scolaire' 
                    : assignments.length === 0 
                      ? 'Aucun examen/devoir disponible pour cette année' 
                      : 'Sélectionner un examen'}
                </option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title} - {assignment.type} - Max: {assignment.max_score || assignment.total_score || 'N/A'}
                  </option>
                ))}
              </select>
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
              )}
              {form.school_year_id && assignments.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  Aucun examen ou devoir disponible pour cette année scolaire. Créez d'abord des examens/devoirs.
                </p>
              )}
            </div>

            <div>
              <Label>Matière *</Label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                disabled={!form.school_year_id || !form.classroom_id || !form.assignment_id}
                required
              >
                <option value="">
                  {!form.assignment_id 
                    ? 'Sélectionnez d\'abord un examen/devoir' 
                    : filteredSubjects.length === 0 
                      ? 'Aucune matière disponible pour ce devoir' 
                      : 'Sélectionner une matière'}
                </option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code}) {subject.coefficient ? `- Coef: ${subject.coefficient}` : ''}
                  </option>
                ))}
              </select>
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
              )}
              {form.school_year_id && !form.classroom_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une classe</p>
              )}
              {form.school_year_id && form.classroom_id && !form.assignment_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner un examen/devoir</p>
              )}
              {form.assignment_id && filteredSubjects.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  Aucune matière disponible pour ce devoir. Le devoir sélectionné n'est peut-être pas lié à une matière de cette classe.
                </p>
              )}
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
                placeholder={
                  !form.school_year_id 
                    ? "Sélectionnez d'abord une année scolaire" 
                    : !form.classroom_id 
                      ? "Sélectionnez d'abord une classe"
                      : students.length === 0
                        ? "Aucun élève disponible"
                        : "Sélectionner un élève"
                }
                searchPlaceholder="Rechercher un élève..."
                disabled={!form.school_year_id || !form.classroom_id}
                required
              />
              {!form.school_year_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une année scolaire</p>
              )}
              {form.school_year_id && !form.classroom_id && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une classe</p>
              )}
              {form.school_year_id && form.classroom_id && students.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  Aucun élève inscrit dans cette classe pour cette année scolaire.
                </p>
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
