import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTable from "../../components/common/DataTable";
import { useCustomModal } from "../../context/ModalContext";
import evaluationTypeService, { EvaluationType } from "../../api/services/evaluationTypeService";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useActiveSchoolYear } from "../../context/SchoolYearContext";

export default function EvaluationTypeManagement() {
  const { openModal, closeModal } = useCustomModal();
  const { activeSchoolYear } = useActiveSchoolYear();
  const [types, setTypes] = useState<EvaluationType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await evaluationTypeService.list({ school_year_id: activeSchoolYear?.id });
      if (res && res.success) {
        setTypes(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSchoolYear) {
      fetchTypes();
    }
  }, [activeSchoolYear]);

  const showFormModal = (editingItem?: EvaluationType) => {
    openModal({
      title: editingItem ? "Éditer le type d'évaluation" : "Ajouter un type d'évaluation",
      content: () => {
        const ModalForm: React.FC = () => {
          const [local, setLocal] = useState<Partial<EvaluationType>>(
            editingItem || {
              name: "",
              weight: 1,
              school_year_id: activeSchoolYear?.id,
            }
          );

          const submit = async () => {
            if (!local.name || !local.weight) {
              openModal({ title: "Validation", description: "Veuillez remplir les champs obligatoires.", variant: "error" });
              return;
            }
            setLoading(true);
            try {
              if (editingItem && editingItem.id) {
                await evaluationTypeService.update(editingItem.id, local);
                openModal({ title: "Succès", description: "Type mis à jour.", variant: "success" });
              } else {
                await evaluationTypeService.create(local);
                openModal({ title: "Succès", description: "Type ajouté.", variant: "success" });
              }
              closeModal();
              fetchTypes();
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
                <Label>Nom (Ex: Devoir, Composition)</Label>
                <Input type="text" value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} />
              </div>
              <div>
                <Label>Coefficient par défaut</Label>
                <Input type="number" step={0.1} value={local.weight?.toString()} onChange={(e) => setLocal({ ...local, weight: parseFloat(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal}>Annuler</Button>
                <Button onClick={submit}>{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
              </div>
            </div>
          );
        };
        return <ModalForm />;
      },
      variant: "info",
    });
  };

  const handleDelete = (item: EvaluationType) => {
    openModal({
      title: "Confirmer la suppression",
      description: `Êtes-vous sûr de vouloir supprimer le type "${item.name}" ?`,
      variant: "error",
      primaryLabel: "Supprimer",
      primaryAction: async () => {
        try {
          await evaluationTypeService.remove(item.id);
          openModal({ title: "Succès", description: "Type supprimé.", variant: "success" });
          fetchTypes();
        } catch (e) {
          console.error(e);
          openModal({ title: "Erreur", description: "Impossible de supprimer.", variant: "error" });
        }
      },
    });
  };

  return (
    <>
      <PageMeta title="Types d'Évaluation" description="Gestion des types d'évaluation (Devoirs, Examens...)" />
      <PageBreadcrumb pageTitle="Types d'Évaluation" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">Types d'Évaluation</h2>
            <p className="text-sm text-gray-500 mt-1">Définissez les types d'évaluations et leurs coefficients.</p>
          </div>
          <Button onClick={() => showFormModal()}>+ Nouveau Type</Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Nom" },
            { key: "weight", label: "Coefficient" },
          ]}
          data={types}
          loading={loading}
          onEdit={showFormModal}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
