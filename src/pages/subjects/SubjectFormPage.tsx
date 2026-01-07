import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { useCustomModal } from "../../context/ModalContext";
import subjectService from "../../api/services/subjectService";
import schoolYearService from "../../api/services/schoolYearService";

interface SubjectForm {
  name: string;
  code: string;
  coefficient: number;
  school_year_id?: number | string;
}

export default function SubjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { openModal } = useCustomModal();

  const [form, setForm] = useState<SubjectForm>({
    name: "",
    code: "",
    coefficient: 1,
    school_year_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);

  useEffect(() => {
    loadSchoolYears();
    if (isEditing) {
      fetchSubject();
    }
  }, [id]);

  const loadSchoolYears = async () => {
    try {
      const res = await schoolYearService.list();
      if (res && res.success) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
           if (Array.isArray(res.data[0])) {
               items = res.data[0];
           } else {
               items = res.data;
           }
        } else if (res.data?.data) {
           items = res.data.data;
        }
        
        // Deduplicate
        const uniqueItems = items.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => (t.id === v.id)) === i);
        setSchoolYears(uniqueItems.map((sy: any) => ({
            value: sy.id,
            label: sy.label
        })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubject = async () => {
    setLoading(true);
    try {
      const res = await subjectService.get(parseInt(id!));
      console.log('Fetched subject response:', res);
      
      if (res && res.success) {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log('Subject data:', data);
        
        const formData = {
          name: data.name || "",
          code: data.code || "",
          coefficient: data.coefficient || 1,
          // Convert to string for Select component, or empty string if null/undefined
          school_year_id: data.school_year_id ? String(data.school_year_id) : "",
        };
        
        console.log('Setting form data:', formData);
        setForm(formData);
      } else {
          openModal({
              title: "Erreur",
              description: "Matière introuvable",
              variant: "error"
          });
          navigate("/subjects");
      }
    } catch (e) {
      console.error(e);
      openModal({
        title: "Erreur",
        description: "Impossible de charger les détails de la matière.",
        variant: "error",
      });
      navigate("/subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.code) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir les champs obligatoires (Nom et Code).",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
          ...form,
          // Convert school_year_id to number if present, or remove it if empty
          school_year_id: form.school_year_id ? Number(form.school_year_id) : undefined,
          // Ensure coefficient is a valid number
          coefficient: Number(form.coefficient) || 1
      };

      console.log('Payload being sent:', payload);

      if (isEditing) {
        await subjectService.update(parseInt(id!), payload);
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
      navigate("/subjects");
    } catch (error: any) {
      console.error('Full error:', error);
      console.error('Error response:', error?.response);
      
      let errorMessage = "Une erreur s'est produite lors de l'enregistrement.";
      
      // Check if it's a validation error (422)
      if (error?.response?.status === 422) {
        const validationErrors = error?.response?.data?.data;
        if (validationErrors) {
          // Format validation errors
          const errorList = Object.entries(validationErrors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field === 'name' ? 'Nom' : 
                               field === 'code' ? 'Code' : 
                               field === 'coefficient' ? 'Coefficient' : field;
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          errorMessage = `Erreurs de validation:\n${errorList}`;
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      openModal({
        title: "Erreur",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title={isEditing ? "Modifier la matière" : "Nouvelle matière"}
        description={isEditing ? "Modifier les détails de la matière" : "Créer une nouvelle matière"}
      />
      <PageBreadcrumb pageTitle={isEditing ? "Modifier la matière" : "Nouvelle matière"} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
          {isEditing ? "Informations de la matière" : "Créer une matière"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nom de la matière <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Mathématiques"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
              <Input
                id="code"
                type="text"
                placeholder="Ex: MATH"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="coefficient">Coefficient (par défaut)</Label>
              <Input
                id="coefficient"
                type="number"
                placeholder="1"
                min="0.5"
                step="0.5"
                value={form.coefficient}
                onChange={(e) => setForm({ ...form, coefficient: parseFloat(e.target.value) || 1 })}
              />
            </div>

            <div>
              <Label htmlFor="school_year_id">Année scolaire <span className="text-red-500">*</span></Label>
              <Select
                options={[{value: "", label: "Toutes les années"}, ...schoolYears]}
                value={form.school_year_id ? String(form.school_year_id) : ""}
                onChange={(value) => setForm({ ...form, school_year_id: value })}
                placeholder="Sélectionner une année scolaire"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/subjects")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : (isEditing ? "Mettre à jour" : "Créer")}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
