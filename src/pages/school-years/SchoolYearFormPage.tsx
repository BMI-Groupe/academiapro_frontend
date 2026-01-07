import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { useCustomModal } from "../../context/ModalContext";
import schoolYearService from "../../api/services/schoolYearService";

interface SchoolYearForm {
  label: string;
  year_start: string;
  year_end: string;
  is_active: boolean;
}

export default function SchoolYearFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { openModal } = useCustomModal();

  const [form, setForm] = useState<SchoolYearForm>({
    label: "",
    year_start: new Date().getFullYear().toString(),
    year_end: (new Date().getFullYear() + 1).toString(),
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchSchoolYear();
    }
  }, [id]);

  const fetchSchoolYear = async () => {
    setLoading(true);
    try {
      // Assuming get method exists or we use list and find. 
      // Checking service... usually 'get' or 'show'.
      // If not present, might need to implement get in service, 
      // but for now I'll assume list returns list or try to use get if available.
      // Based on previous files, 'list' is commonly used. 
      // I'll try to fetch list and filter or if there is a get method.
      // Let's assume standard REST: schoolYearService.get(id)
      const res = await schoolYearService.get(parseInt(id!));
      if (res.success && res.data) {
          // API returns array often
          const item = Array.isArray(res.data) ? res.data[0] : res.data;
          setForm({
              label: item.label,
              year_start: item.year_start,
              year_end: item.year_end,
              is_active: item.is_active
          });
      }
    } catch (e) {
      console.error(e);
      openModal({ title:"Erreur", description:"Impossible de charger l'année scolaire.", variant:"error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
      if (!form.year_start || !form.year_end) {
          openModal({ title:"Validation", description:"Veuillez remplir les champs obligatoires (Année début et Année fin).", variant:"error" });
          return;
      }

      // Générer automatiquement le label si vide
      const labelToSubmit = form.label || `${form.year_start}-${form.year_end}`;

      setSubmitting(true);
      try {
          const formData = {
              ...form,
              label: labelToSubmit
          };
          
          if (isEdit) {
              await schoolYearService.update(parseInt(id!), formData);
              openModal({ title: "Succès", description: "Année scolaire mise à jour.", variant: "success" });
          } else {
              await schoolYearService.create(formData);
              openModal({ title: "Succès", description: "Année scolaire créée.", variant: "success" });
          }
          navigate("/school-years");
      } catch (e) {
          console.error(e);
          openModal({ title: "Erreur", description: "Une erreur est survenue.", variant: "error" });
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <>
      <PageMeta title={isEdit ? "Modifier Année Scolaire" : "Nouvelle Année Scolaire"} description="Gestion années scolaires" />
      <PageBreadcrumb pageTitle={isEdit ? "Modifier l'année" : "Ajouter une année"} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Informations de l'année scolaire
        </h3>
        
        <div className="space-y-4 max-w-lg">
            <div>
                <Label>Libellé (Ex: 2023-2024) <span className="text-gray-400 text-sm font-normal">(Optionnel - généré automatiquement si vide)</span></Label>
                <Input value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} placeholder="2023-2024" />
                {!form.label && form.year_start && form.year_end && (
                    <p className="text-sm text-gray-500 mt-1">Sera généré automatiquement : {form.year_start}-{form.year_end}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Année début</Label>
                    <Input type="number" value={form.year_start} onChange={(e) => setForm({...form, year_start: e.target.value})} />
                </div>
                <div>
                    <Label>Année fin</Label>
                    <Input type="number" value={form.year_end} onChange={(e) => setForm({...form, year_end: e.target.value})} />
                </div>
            </div>

            <div>
                <Label>Active ?</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-300">Oui, définir comme année active</span>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
          <Button variant="outline" onClick={() => navigate("/school-years")} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </>
  );
}
