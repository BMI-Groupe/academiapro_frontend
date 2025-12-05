import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import schoolYearService from "../../api/services/schoolYearService";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

interface SchoolYearForm {
  label: string;
  year_start: string;
  year_end: string;
  is_active: boolean;
}

export default function SchoolYearManagement() {
  const { openModal, closeModal } = useCustomModal();
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SchoolYearForm>({
    label: "",
    year_start: "",
    year_end: "",
    is_active: false,
  });

  const fetchSchoolYears = async () => {
    setLoading(true);
    try {
      const res = await schoolYearService.list();
      console.log("School years", res);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const showFormModal = () => {
    openModal({
      title: editingId ? "Éditer l'année scolaire" : "Ajouter une année scolaire",
      content: () => {
        const ModalForm: React.FC = () => {
          const [local, setLocal] = useState({ ...form });

          const submit = async () => {
            if (!local.label || !local.year_start || !local.year_end) {
              openModal({ title: "Validation", description: "Veuillez remplir les champs obligatoires.", variant: "error" });
              return;
            }
            setLoading(true);
            try {
              const payload = { ...local };
              if (editingId) {
                await schoolYearService.update(editingId, payload);
                openModal({ title: "Succès", description: "Année scolaire mise à jour.", variant: "success" });
              } else {
                await schoolYearService.create(payload);
                openModal({ title: "Succès", description: "Année scolaire ajoutée.", variant: "success" });
              }
              closeModal();
              await fetchSchoolYears();
            } catch (e) {
              console.error(e);
              openModal({ title: "Erreur", description: "Une erreur est survenue.", variant: "error" });
            } finally {
              setLoading(false);
            }
          };

          return (
            <div className="space-y-4">
              <div>
                <Label>Libellé (Ex: 2023-2024)</Label>
                <Input type="text" value={local.label} onChange={(e) => setLocal({ ...local, label: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Année début</Label>
                  <Input type="number" value={local.year_start} onChange={(e) => setLocal({ ...local, year_start: e.target.value })} />
                </div>
                <div>
                  <Label>Année fin</Label>
                  <Input type="number" value={local.year_end} onChange={(e) => setLocal({ ...local, year_end: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Active ?</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={local.is_active}
                    onChange={(e) => setLocal({ ...local, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-300">Oui, définir comme année active</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal}>Annuler</Button>
                <Button onClick={submit}>{editingId ? "Mettre à jour" : "Ajouter"}</Button>
              </div>
            </div>
          );
        };
        return <ModalForm />;
      },
      variant: "info",
    });
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({
      label: "",
      year_start: new Date().getFullYear().toString(),
      year_end: (new Date().getFullYear() + 1).toString(),
      is_active: false,
    });
    showFormModal();
  };

  const handleOpenEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      label: item.label || "",
      year_start: item.year_start || "",
      year_end: item.year_end || "",
      is_active: item.is_active || false,
    });
    showFormModal();
  };

  const handleDelete = (item: any) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer l'année scolaire "${item.label}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await schoolYearService.remove(item.id);
          openModal({ title: "Succès", description: "Année scolaire supprimée.", variant: "success" });
          await fetchSchoolYears();
        } catch (e) {
          console.error(e);
          openModal({ title: "Erreur", description: "Impossible de supprimer.", variant: "error" });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Années Scolaires" description="Gestion des années scolaires" />
      <PageBreadcrumb pageTitle="Années Scolaires" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">Années Scolaires</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez les années scolaires et définissez l'année active.</p>
          </div>
          <Button onClick={handleOpenCreateModal}>+ Nouvelle année</Button>
        </div>

        <DataTable
          columns={[
            { key: "label", label: "Libellé" },
            { key: "year_start", label: "Début" },
            { key: "year_end", label: "Fin" },
            { key: "is_active", label: "Active", render: (val: boolean) => (val ? <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Oui</span> : <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Non</span>) },
          ]}
          data={schoolYears}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
