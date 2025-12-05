import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import gradeService from "../../api/services/gradeService";
import studentService from "../../api/services/studentService";
import subjectService from "../../api/services/subjectService";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface GradeForm {
  student_id: number | undefined;
  subject_id: number | undefined;
  classroom_id: number | undefined;
  score: number;
  assignment_type: string;
  notes: string;
  teacher_id?: number;
  school_year_id?: number;
}

export default function GradeManagement() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useCustomModal();
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GradeForm>({
    student_id: undefined,
    subject_id: undefined,
    classroom_id: undefined,
    score: 0,
    assignment_type: "exam",
    notes: "",
  });

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await gradeService.list();
      if (res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          // If the first element is a paginator/resource with `data` key
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else {
            // otherwise assume res.data is already the items array
            items = res.data as any[];
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }

        setGrades(items || []);
      } else {
        setGrades([]);
      }
    } catch (e) {
      console.error(e);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentService.list();
      if (res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          // If the first element is a paginator/resource with `data` key
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else {
            // otherwise assume res.data is already the items array
            items = res.data as any[];
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }

        setStudents(items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await subjectService.list();
      if (res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          // If the first element is a paginator/resource with `data` key
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } else {
            // otherwise assume res.data is already the items array
            items = res.data as any[];
          }
        } else if (res.data && Array.isArray(res.data.data)) {
          items = res.data.data;
        }

        setSubjects(items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchSubjects();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({
      student_id: undefined,
      subject_id: undefined,
      classroom_id: undefined,
      score: 0,
      assignment_type: "exam",
      notes: "",
    });
    showFormModal();
  };

  const handleOpenEditModal = (grade: any) => {
    setEditingId(grade.id);
    setForm({
      student_id: grade.student_id,
      subject_id: grade.subject_id,
      classroom_id: grade.classroom_id,
      score: grade.score || 0,
      assignment_type: grade.assignment_type || "exam",
      notes: grade.notes || "",
    });
    showFormModal();
  };

  const showFormModal = () => {
    openModal({
      title: editingId ? "Éditer la note" : "Ajouter une note",
      content: () => {
        const ModalForm: React.FC = () => {
          const [local, setLocal] = useState({
            student_id: form.student_id,
            subject_id: form.subject_id,
            classroom_id: form.classroom_id,
            score: form.score,
            assignment_type: form.assignment_type,
            notes: form.notes,
          });

          useEffect(
            () =>
              setLocal({
                student_id: form.student_id,
                subject_id: form.subject_id,
                classroom_id: form.classroom_id,
                score: form.score,
                assignment_type: form.assignment_type,
                notes: form.notes,
              }),
            [form]
          );

          const submit = async () => {
            if (!local.student_id || !local.subject_id) {
              openModal({
                title: "Validation",
                description: "Veuillez remplir les champs obligatoires.",
                variant: "error",
              });
              return;
            }
            setLoading(true);
            try {
              const payload = { ...local } as any;
              if (editingId) {
                await gradeService.update(editingId, payload);
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
              closeModal();
              await fetchGrades();
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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Élève</Label>
                  <select
                    value={String(local.student_id || "")}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        student_id: parseInt(e.target.value),
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Sélectionner un élève</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Matière</Label>
                  <select
                    value={String(local.subject_id || "")}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        subject_id: parseInt(e.target.value),
                      })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Sélectionner une matière</option>
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Score (0-20)</Label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={local.score as any}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        score: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <Label>Type d'évaluation</Label>
                  <select
                    value={local.assignment_type}
                    onChange={(e) =>
                      setLocal({ ...local, assignment_type: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="exam">Examen</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Devoir</option>
                    <option value="participation">Participation</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Commentaires</Label>
                <textarea
                  placeholder="Ajouter des commentaires..."
                  value={local.notes}
                  onChange={(e) =>
                    setLocal({ ...local, notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal}>
                  Annuler
                </Button>
                <Button onClick={submit}>
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </div>
          );
        };

        return <ModalForm />;
      },
      variant: "info",
    });
  };

  const handleSubmitForm = async () => {
    if (!form.student_id || !form.subject_id || form.score === null) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir les champs obligatoires.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };

      if (editingId) {
        await gradeService.update(editingId, payload);
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

      closeModal();
      await fetchGrades();
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

  const handleDelete = (grade: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer cette note ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await gradeService.remove(grade.id);
          openModal({
            title: "Succès",
            description: "Note supprimée avec succès.",
            variant: "success",
          });
          await fetchGrades();
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de supprimer la note.",
            variant: "error",
          });
        }
      },
    });
  };

  const handleNavigateToCreate = () => {
    navigate("/grades/new");
  };

  const handleNavigateToEdit = (grade: any) => {
    navigate(`/grades/edit?id=${grade.id}`);
  };

  return (
    <>
      <PageMeta
        title="Gestion des notes"
        description="Gestion des notes des élèves"
      />
      <PageBreadcrumb pageTitle="Gestion des notes" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
              Notes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Entrez et gérez les notes des élèves.
            </p>
          </div>
          <Button onClick={handleNavigateToCreate}>+ Ajouter une note</Button>
        </div>

        <DataTable
          columns={[
            {
              key: "student",
              label: "Élève",
              render: (value: any) =>
                value ? `${value.first_name} ${value.last_name}` : "-",
            },
            {
              key: "assignment",
              label: "Examen",
              render: (value: any) => value?.title || "-",
            },
            { key: "score", label: "Score" },
            { key: "graded_at", label: "Date" },
          ]}
          data={grades}
          loading={loading}
          onEdit={handleNavigateToEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
