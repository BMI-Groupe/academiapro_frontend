import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import classroomService from "../../api/services/classroomService";
import { useCustomModal } from "../../context/ModalContext";

interface ClassroomForm {
  name: string;
  code: string;
  level: string;
  cycle: string;
}

const emptyForm: ClassroomForm = {
  name: "",
  code: "",
  level: "",
  cycle: "",
};

export default function ClassroomFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { openModal } = useCustomModal();

  const isEditMode = Boolean(id);
  const [form, setForm] = useState<ClassroomForm>(emptyForm);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectClasses =
    "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  const pageTitle = useMemo(
    () => (isEditMode ? "Modifier une classe" : "Créer une classe"),
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

    const fetchClassroom = async () => {
      setFetching(true);
      try {
        const res = await classroomService.get(Number(id));
        const payload = resolvePayload(res);

        setForm({
          name: payload?.name ?? "",
          code: payload?.code ?? "",
          level: payload?.level ?? "",
          cycle: payload?.cycle ?? "",
        });
      } catch (error) {
        console.error(error);
        openModal({
          title: "Erreur",
          description: "Impossible de charger la classe sélectionnée.",
          variant: "error",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchClassroom();
  }, [id, isEditMode, openModal]);

  const handleChange = (key: keyof ClassroomForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name || !form.code || !form.level || !form.cycle) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir tous les champs du formulaire.",
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
        name: form.name,
        code: form.code,
        level: form.level,
        cycle: form.cycle,
      };

      if (isEditMode && id) {
        await classroomService.update(Number(id), payload);
        openModal({
          title: "Succès",
          description: "Classe mise à jour avec succès.",
          variant: "success",
        });
      } else {
        await classroomService.create(payload);
        openModal({
          title: "Succès",
          description: "Classe créée avec succès.",
          variant: "success",
        });
      }

      navigate("/classrooms");
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
      <PageMeta title={pageTitle} description="Gestion des classes de l'école" />
      <PageBreadcrumb pageTitle={pageTitle} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">{pageTitle}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Mettez à jour les informations de la classe."
                : "Renseignez les informations pour créer une nouvelle classe."}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/classrooms")}>
            Retour aux classes
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
              <div>
                <Label htmlFor="classroom-name">Nom de la classe</Label>
                <Input
                  id="classroom-name"
                  placeholder="Ex: 6e A"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="classroom-code">Code</Label>
                <Input
                  id="classroom-code"
                  placeholder="Ex: 6A"
                  value={form.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="classroom-level">Niveau</Label>
                  <select
                    id="classroom-level"
                    value={form.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                    className={selectClasses}
                    disabled={submitting}
                  >
                    <option value="">Sélectionner</option>
                    <option value="6">6ème</option>
                    <option value="5">5ème</option>
                    <option value="4">4ème</option>
                    <option value="3">3ème</option>
                    <option value="2nde">2nde</option>
                    <option value="1ère">1ère</option>
                    <option value="Terminale">Terminale</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="classroom-cycle">Cycle</Label>
                  <select
                    id="classroom-cycle"
                    value={form.cycle}
                    onChange={(e) => handleChange("cycle", e.target.value)}
                    className={selectClasses}
                    disabled={submitting}
                  >
                    <option value="">Sélectionner</option>
                    <option value="primaire">Primaire</option>
                    <option value="college">Collège</option>
                    <option value="lycee">Lycée</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 md:flex-row md:justify-end">
                <Button variant="outline" onClick={() => navigate("/classrooms")} disabled={submitting}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Créer la classe"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

