import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import subjectService from "../../api/services/subjectService";
import schoolYearService from "../../api/services/schoolYearService";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";
import SchoolYearFilter from "../../components/common/SchoolYearFilter";
import ActiveSchoolYearAlert from "../../components/common/ActiveSchoolYearAlert";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface SubjectForm {
  name: string;
  code: string;
  coefficient: number;
}

export default function SubjectManagement() {
  const { openModal, closeModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SubjectForm>({
    name: "",
    code: "",
    coefficient: 1,
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectService.list({ school_year_id: selectedYear?.id });
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
      } else {
        setSubjects([]);
      }
    } catch (e) {
      console.error(e);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolYears = async () => {
    try {
      const res = await schoolYearService.list();
      if (res && res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          // Check if the first element is a paginator object (has .data array)
          if (res.data[0] && Array.isArray(res.data[0].data)) {
            items = res.data[0].data;
          } 
          // Check if the first element is the array of items itself (non-paginated case)
          else if (res.data[0] && Array.isArray(res.data[0])) {
            items = res.data[0];
          }
          // Fallback: assume res.data is the list (though unlikely given the controller)
          else {
            items = res.data as any[];
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

  useEffect(() => {
    loadSchoolYears();
  }, []);

  useEffect(() => {
    if (activeSchoolYear && !selectedYear) {
      setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    fetchSubjects();
  }, [selectedYear]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({ name: "", code: "", coefficient: 1 });
    showFormModal();
  };

  const handleOpenEditModal = (subject: any) => {
    setEditingId(subject.id);
    setForm({
      name: subject.name || "",
      code: subject.code || "",
      coefficient: subject.coefficient || 1,
    });
    showFormModal();
  };

  const showFormModal = () => {
    openModal({
      title: editingId ? "Éditer la matière" : "Créer une matière",
      content: () => {
        const ModalForm: React.FC = () => {
          const [local, setLocal] = useState({
            name: form.name,
            code: form.code,
            coefficient: form.coefficient,
          });

          useEffect(
            () =>
              setLocal({
                name: form.name,
                code: form.code,
                coefficient: form.coefficient,
              }),
            [form]
          );

          const submit = async () => {
            if (!local.name || !local.code) {
              openModal({
                title: "Validation",
                description: "Veuillez remplir les champs obligatoires.",
                variant: "error",
              });
              return;
            }
            setLoading(true);
            try {
              const payload = { ...local };
              if (editingId) {
                await subjectService.update(editingId, payload);
                openModal({
                  title: "Succès",
                  description: "Matière mise à jour avec succès.",
                  variant: "success",
                });
              } else {
                await subjectService.create(payload);
                openModal({
                  title: "Succès",
                  description: "Matière créée avec succès.",
                  variant: "success",
                });
              }
              closeModal();
              await fetchSubjects();
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
            <div className="space-y-4">
              <div>
                <Label>Nom de la matière</Label>
                <Input
                  type="text"
                  placeholder="Ex: Mathématiques"
                  value={local.name}
                  onChange={(e) => setLocal({ ...local, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Code</Label>
                  <Input
                    type="text"
                    placeholder="Ex: MATH"
                    value={local.code}
                    onChange={(e) =>
                      setLocal({ ...local, code: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Coefficient</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={local.coefficient as any}
                    onChange={(e) =>
                      setLocal({
                        ...local,
                        coefficient: parseFloat(e.target.value) || 1,
                      })
                    }
                    min="0.5"
                    step={0.5}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal}>
                  Annuler
                </Button>
                <Button onClick={submit}>
                  {editingId ? "Mettre à jour" : "Créer"}
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
    if (!form.name || !form.code) {
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
        await subjectService.update(editingId, payload);
        openModal({
          title: "Succès",
          description: "Matière mise à jour avec succès.",
          variant: "success",
        });
      } else {
        await subjectService.create(payload);
        openModal({
          title: "Succès",
          description: "Matière créée avec succès.",
          variant: "success",
        });
      }

      closeModal();
      await fetchSubjects();
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

  const handleDelete = (subject: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer la matière "${subject.name}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await subjectService.remove(subject.id);
          openModal({
            title: "Succès",
            description: "Matière supprimée avec succès.",
            variant: "success",
          });
          await fetchSubjects();
        } catch (e) {
          console.error(e);
          openModal({
            title: "Erreur",
            description: "Impossible de supprimer la matière.",
            variant: "error",
          });
        }
      },
    });
  };

  return (
    <>
      <PageMeta
        title="Gestion des matières"
        description="Gestion des matières de l'école"
      />
      <PageBreadcrumb pageTitle="Gestion des matières" />

      <div className="space-y-6">
        <ActiveSchoolYearAlert />

        <div className="flex justify-between items-start gap-4">
          <SchoolYearFilter
            value={selectedYear}
            onChange={setSelectedYear}
            years={schoolYears}
            loading={loading}
            className="w-64"
          />
          <Button onClick={handleOpenCreateModal}>+ Nouvelle matière</Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nom" },
            { key: "code", label: "Code" },
            { key: "coefficient", label: "Coefficient" },
          ]}
          data={subjects}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
