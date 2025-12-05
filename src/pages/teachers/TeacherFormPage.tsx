import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import teacherService from "../../api/services/teacherService";
import { useCustomModal } from "../../context/ModalContext";

interface TeacherForm {
  first_name: string;
  last_name: string;
  phone: string;
  specialization: string;
  birth_date: string;
}

const emptyForm: TeacherForm = {
  first_name: "",
  last_name: "",
  phone: "",
  specialization: "",
  birth_date: "",
};

export default function TeacherFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { openModal } = useCustomModal();

  const isEditMode = Boolean(id);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pageTitle = useMemo(
    () => (isEditMode ? "Modifier un enseignant" : "Ajouter un enseignant"),
    [isEditMode],
  );

  const resolvePayload = (response: any) => {
    if (!response) return null;
    if (Array.isArray(response.data)) {
      const first = response.data[0];
      if (first && typeof first === "object" && "data" in first && !Array.isArray(first.data)) {
        return first.data;
      }
      return first;
    }
    return response.data;
  };

  useEffect(() => {
    if (!isEditMode || !id) {
      setForm(emptyForm);
      return;
    }

    const fetchTeacher = async () => {
      setFetching(true);
      try {
        const res = await teacherService.get(Number(id));
        const payload = resolvePayload(res);

        setForm({
          first_name: payload?.first_name ?? "",
          last_name: payload?.last_name ?? "",
          phone: payload?.phone ?? "",
          specialization: payload?.specialization ?? "",
          birth_date: payload?.birth_date ?? "",
        });
      } catch (error) {
        console.error(error);
        openModal({
          title: "Erreur",
          description: "Impossible de charger l'enseignant sélectionné.",
          variant: "error",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchTeacher();
  }, [id, isEditMode, openModal]);

  const handleChange = (key: keyof TeacherForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.first_name || !form.last_name) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir les champs obligatoires (Prénom, Nom).",
        variant: "error",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
        specialization: form.specialization || undefined,
        birth_date: form.birth_date || undefined,
      };

      if (isEditMode && id) {
        await teacherService.update(Number(id), payload);
        openModal({
          title: "Succès",
          description: "Enseignant mis à jour avec succès.",
          variant: "success",
        });
      } else {
        await teacherService.create(payload);
        openModal({
          title: "Succès",
          description: "Enseignant créé avec succès.",
          variant: "success",
        });
      }

      navigate("/teachers");
    } catch (error) {
      console.error(error);
      openModal({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title={pageTitle} description="Gestion des enseignants de l'école" />
      <PageBreadcrumb pageTitle={pageTitle} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">{pageTitle}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Mettez à jour les informations de l'enseignant."
                : "Renseignez les informations pour ajouter un nouvel enseignant."}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/teachers")}>
            Retour aux enseignants
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {fetching ? (
            <p className="text-center text-gray-500">Chargement des informations...</p>
          ) : (
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="teacher-first-name">Prénom *</Label>
                  <Input
                    id="teacher-first-name"
                    placeholder="Ex: Jean"
                    value={form.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="teacher-last-name">Nom *</Label>
                  <Input
                    id="teacher-last-name"
                    placeholder="Ex: Dupont"
                    value={form.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="teacher-phone">Téléphone</Label>
                  <Input
                    id="teacher-phone"
                    placeholder="Ex: 070000001"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="teacher-specialization">Spécialisation</Label>
                  <Input
                    id="teacher-specialization"
                    placeholder="Ex: Mathématiques"
                    value={form.specialization}
                    onChange={(e) => handleChange("specialization", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="teacher-birth-date">Date de naissance</Label>
                <Input
                  id="teacher-birth-date"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => handleChange("birth_date", e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4 md:flex-row md:justify-end">
                <Button variant="outline" onClick={() => navigate("/teachers")} disabled={submitting}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Créer l'enseignant"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
