import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import teacherService from "../../api/services/teacherService";
import { useCustomModal } from "../../context/ModalContext";
import { sendTeacherCredentials } from "../../api/services/emailService";
import DatePicker from "../../components/form/date-picker";

interface TeacherForm {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  specialization: string;
  birth_date: string;
}

const emptyForm: TeacherForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
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
          email: payload?.user?.email ?? "",
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
    
    // Email requis pour la création (pour l'envoi des identifiants)
    if (!isEditMode && !form.email) {
      openModal({
        title: "Validation",
        description: "L'email est requis pour créer un compte enseignant et envoyer les identifiants.",
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
        email: form.email || undefined,
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
        navigate("/teachers");
      } else {
        // Création d'un nouvel enseignant
        const res = await teacherService.create(payload);
        
        console.log("Réponse création enseignant:", res);
        
        if (res.success && res.data) {
          const responseData = Array.isArray(res.data) ? res.data[0] : res.data;
          
          if (responseData && responseData.credentials) {
            const credentials = responseData.credentials;
            const teacherName = `${form.first_name} ${form.last_name}`;
            
            // Envoyer l'email avec les identifiants
            console.log("Envoi de l'email à l'enseignant...");
            const emailResult = await sendTeacherCredentials(
              credentials.email,
              credentials.phone || "",
              credentials.password,
              teacherName
            );

            if (emailResult.success) {
              openModal({
                title: "Succès",
                description: `Enseignant créé avec succès ! Un email avec les identifiants a été envoyé à ${credentials.email}`,
                variant: "success",
              });
            } else {
              openModal({
                title: "Attention",
                description: `Enseignant créé mais l'email n'a pas pu être envoyé. Identifiants : ${credentials.phone || credentials.email} / ${credentials.password}`,
                variant: "success",
              });
            }
          } else {
            openModal({
              title: "Succès",
              description: "Enseignant créé avec succès.",
              variant: "success",
            });
          }
        }
        
        navigate("/teachers");
      }
    } catch (error: any) {
      console.error("Erreur complète:", error);
      console.error("Réponse du serveur:", error.response?.data);
      
      let errorMessage = "Une erreur est survenue lors de l'enregistrement.";
      
      // Extraire le message d'erreur du serveur
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Erreurs de validation Laravel
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0] as string;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      openModal({
        title: "Erreur",
        description: errorMessage,
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
                  <Label htmlFor="teacher-email">Email {!isEditMode && "*"}</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="Ex: enseignant@ecole.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={submitting}
                  />
                  {!isEditMode && <p className="text-xs text-gray-500 mt-1">Pour recevoir les identifiants de connexion</p>}
                </div>

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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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

                <div>
                  <DatePicker 
                    id="teacher-birth-date"
                    label="Date de naissance"
                    placeholder="Sélectionner une date"
                    defaultDate={form.birth_date}
                    onChange={(dates, dateStr) => handleChange("birth_date", dateStr)}
                  />
                </div>
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
