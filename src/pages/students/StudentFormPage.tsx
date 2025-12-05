import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import studentService from "../../api/services/studentService";
import classroomService from "../../api/services/classroomService";
import { useCustomModal } from "../../context/ModalContext";

interface StudentForm {
  first_name: string;
  last_name: string;
  matricule: string;
  birth_date: string;
  gender: string;
  parent_contact: string;
  address: string;
  classroom_id?: number;
}

const emptyForm: StudentForm = {
  first_name: "",
  last_name: "",
  matricule: "",
  birth_date: "",
  gender: "M",
  parent_contact: "",
  address: "",
  classroom_id: undefined,
};

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { openModal } = useCustomModal();

  const isEditMode = Boolean(id);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectClasses =
    "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  const pageTitle = useMemo(
    () => (isEditMode ? "Modifier un élève" : "Ajouter un élève"),
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
    const fetchClassrooms = async () => {
      try {
        const res = await classroomService.list();
        if (res && res.success) {
          let items: any[] = [];
          if (Array.isArray(res.data)) {
            if (res.data[0] && Array.isArray(res.data[0].data)) {
              items = res.data[0].data;
            } else if (res.data[0] && Array.isArray(res.data[0])) {
              items = res.data[0];
            } else {
              items = res.data as any[];
            }
          }
          setClassrooms(items || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (!isEditMode || !id) {
      setForm(emptyForm);
      return;
    }

    const fetchStudent = async () => {
      setFetching(true);
      try {
        const res = await studentService.get(Number(id));
        const payload = resolvePayload(res);

        setForm({
          first_name: payload?.first_name ?? "",
          last_name: payload?.last_name ?? "",
          matricule: payload?.matricule ?? "",
          birth_date: payload?.birth_date ?? "",
          gender: payload?.gender ?? "M",
          parent_contact: payload?.parent_contact ?? "",
          address: payload?.address ?? "",
          classroom_id: payload?.classroom_id,
        });
      } catch (error) {
        console.error(error);
        openModal({
          title: "Erreur",
          description: "Impossible de charger l'élève sélectionné.",
          variant: "error",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchStudent();
  }, [id, isEditMode, openModal]);

  const handleChange = (key: keyof StudentForm, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!form.first_name || !form.last_name || !form.matricule) {
      openModal({
        title: "Validation",
        description: "Veuillez remplir les champs obligatoires (Prénom, Nom, Matricule).",
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
        matricule: form.matricule,
        birth_date: form.birth_date || undefined,
        gender: form.gender,
        parent_contact: form.parent_contact || undefined,
        address: form.address || undefined,
        classroom_id: form.classroom_id || undefined,
      };

      if (isEditMode && id) {
        await studentService.update(Number(id), payload);
        openModal({
          title: "Succès",
          description: "Élève mis à jour avec succès.",
          variant: "success",
        });
      } else {
        await studentService.create(payload);
        openModal({
          title: "Succès",
          description: "Élève créé avec succès.",
          variant: "success",
        });
      }

      navigate("/students");
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
      <PageMeta title={pageTitle} description="Gestion des élèves de l'école" />
      <PageBreadcrumb pageTitle={pageTitle} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">{pageTitle}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Mettez à jour les informations de l'élève."
                : "Renseignez les informations pour ajouter un nouvel élève."}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/students")}>
            Retour aux élèves
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
                  <Label htmlFor="student-first-name">Prénom *</Label>
                  <Input
                    id="student-first-name"
                    placeholder="Ex: Alice"
                    value={form.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="student-last-name">Nom *</Label>
                  <Input
                    id="student-last-name"
                    placeholder="Ex: Martin"
                    value={form.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="student-matricule">Matricule *</Label>
                  <Input
                    id="student-matricule"
                    placeholder="Ex: 2023001"
                    value={form.matricule}
                    onChange={(e) => handleChange("matricule", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="student-classroom">Classe</Label>
                  <select
                    id="student-classroom"
                    value={String(form.classroom_id || 0)}
                    onChange={(e) => handleChange("classroom_id", Number(e.target.value))}
                    className={selectClasses}
                    disabled={submitting}
                  >
                    <option value={0}>Sélectionnez une classe</option>
                    {classrooms.map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="student-birth-date">Date de naissance</Label>
                  <Input
                    id="student-birth-date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => handleChange("birth_date", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="student-gender">Genre</Label>
                  <select
                    id="student-gender"
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className={selectClasses}
                    disabled={submitting}
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="student-parent-contact">Contact parent</Label>
                <Input
                  id="student-parent-contact"
                  placeholder="Ex: 070000001"
                  value={form.parent_contact}
                  onChange={(e) => handleChange("parent_contact", e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="student-address">Adresse</Label>
                <Input
                  id="student-address"
                  placeholder="Ex: Rue A, Ville"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-3 pt-4 md:flex-row md:justify-end">
                <Button variant="outline" onClick={() => navigate("/students")} disabled={submitting}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Créer l'élève"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
