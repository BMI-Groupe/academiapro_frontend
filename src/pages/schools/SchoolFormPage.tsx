import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import { useCustomModal } from "../../context/ModalContext";
import schoolService from "../../api/services/schoolService";
import { sendDirectorCredentials } from "../../api/services/emailService";

export default function SchoolFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { openModal } = useCustomModal();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadSchool();
    }
  }, [id]);

  const loadSchool = async () => {
     try {
         const res = await schoolService.get(parseInt(id!));
         if (res.success && res.data && res.data[0]) {
             const s = res.data[0];
             setName(s.name);
             setAddress(s.address || "");
             setPhone(s.phone || "");
             setEmail(s.email || "");
             if (s.logo) {
                 setPreview(`http://127.0.0.1:8000/storage/${s.logo}`);
             }
         }
     } catch (e) {
         console.error(e);
     }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setLogo(file);
          setPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async () => {
      if (!name) {
          openModal({ title:"Validation", description:"Le nom de l'école est requis.", variant:"error" });
          return;
      }

      // Pour la création, email et téléphone sont requis
      if (!isEdit && (!email || !phone)) {
          openModal({ 
              title:"Validation", 
              description:"L'email et le téléphone sont requis pour créer le compte directeur.", 
              variant:"error" 
          });
          return;
      }

      setSubmitting(true);
      try {
          const formData = new FormData();
          formData.append('name', name);
          if (address) formData.append('address', address);
          if (phone) formData.append('phone', phone);
          if (email) formData.append('email', email);
          if (logo) formData.append('logo', logo);

          if (isEdit) {
              await schoolService.update(parseInt(id!), formData);
              openModal({
                  title: "Succès",
                  description: "École modifiée avec succès.",
                  variant: "success"
              });
              navigate("/schools");
          } else {
              // Création d'une nouvelle école
              const res = await schoolService.create(formData);
              
              console.log("Réponse complète du serveur:", res);
              console.log("res.data:", res.data);
              
              if (res.success && res.data) {
                  // La réponse peut être soit res.data[0] soit res.data directement
                  const responseData = Array.isArray(res.data) ? res.data[0] : res.data;
                  console.log("responseData:", responseData);
                  
                  // Vérifier si director existe
                  if (responseData && responseData.director && responseData.school) {
                      const director = responseData.director;
                      const school = responseData.school;

                      // Envoyer l'email avec les identifiants
                      console.log("Envoi de l'email au directeur...");
                      const emailResult = await sendDirectorCredentials(
                          director.email,
                          director.phone,
                          director.password,
                          school.name
                      );

                      if (emailResult.success) {
                          openModal({
                              title: "Succès",
                              description: `École créée avec succès ! Un email avec les identifiants a été envoyé à ${director.email}`,
                              variant: "success"
                          });
                      } else {
                          openModal({
                              title: "Attention",
                              description: `École créée mais l'email n'a pas pu être envoyé. Identifiants : ${director.phone} / ${director.password}`,
                              variant: "warning"
                          });
                      }
                  } else {
                      // Fallback si la structure est différente
                      console.error("Structure de réponse inattendue:", responseData);
                      openModal({
                          title: "Succès",
                          description: "École créée avec succès, mais impossible d'envoyer l'email automatiquement.",
                          variant: "success"
                      });
                  }
                  
                  navigate("/schools");
              }
          }
      } catch (e: any) {
          console.error(e);
          openModal({ 
              title:"Erreur", 
              description: e.response?.data?.message || "Une erreur est survenue.", 
              variant:"error" 
          });
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <>
      <PageMeta title={isEdit ? "Modifier École" : "Nouvelle École"} description="Gérer les écoles" />
      <PageBreadcrumb pageTitle={isEdit ? "Modifier l'école" : "Ajouter une école"} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Informations de l'établissement
        </h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1">
                <Label>Nom de l'école *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Groupe Scolaire Excellence" />
            </div>

            <div className="space-y-1">
                <Label>Adresse / Ville</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Abidjan, Cocody..." />
            </div>

            <div className="space-y-1">
                <Label>Téléphone {!isEdit && "*"}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 0102030405" />
                {!isEdit && <p className="text-xs text-gray-500">Sera utilisé comme identifiant du directeur</p>}
            </div>

            <div className="space-y-1">
                <Label>Email {!isEdit && "*"}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@ecole.com" />
                {!isEdit && <p className="text-xs text-gray-500">Pour recevoir les identifiants de connexion</p>}
            </div>

            <div className="col-span-full space-y-1">
                <Label>Logo</Label>
                <div className="flex flex-col gap-4">
                    {preview && (
                        <div className="flex justify-center">
                            <img src={preview} alt="Aperçu" className="h-40 w-40 rounded-lg object-cover border" />
                        </div>
                    )}
                    <DropzoneComponent onFileSelect={(file) => {
                        setLogo(file);
                        setPreview(URL.createObjectURL(file));
                    }} />
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
          <Button variant="outline" onClick={() => navigate("/schools")} disabled={submitting}>
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
