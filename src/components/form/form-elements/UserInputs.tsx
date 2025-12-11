import React, { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import Button from "../../ui/button/Button";
import userService from "../../../api/services/userService";
import { useCustomModal } from "../../../context/ModalContext";
import useAuth from "../../../providers/auth/useAuth";
import schoolService from "../../../api/services/schoolService";
import { sendUserCredentials } from "../../../api/services/emailService";

export default function UserInputs() {
  const { openModal } = useCustomModal();
  // @ts-ignore
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'admin';
  
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  
  const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      role: "",
      school_id: ""
  });

  const roles = [
      { value: "directeur", label: "Directeur" },
      { value: "secretaire", label: "Secrétaire" },
      { value: "comptable", label: "Comptable" },
      ...(isAdmin ? [{ value: "admin", label: "Administrateur" }] : [])
  ];

  // Fetch schools if admin
  useEffect(() => {
      if (isAdmin) {
          const fetchSchools = async () => {
              try {
                  const res = await schoolService.list();
                  if (res && res.data) {
                      let list = Array.isArray(res.data) ? res.data : ((res.data as any).data || []);
                      // @ts-ignore
                      setSchools(list.map((s:any) => ({ value: String(s.id), label: s.name })));
                  }
              } catch (e) { console.error(e); }
          }
          fetchSchools();
      }
  }, [isAdmin]);

  const handleSubmit = async () => {
      if (!form.name || !form.email || !form.role) {
          openModal({ title: "Erreur", description: "Veuillez remplir les champs obligatoires (*)", variant: "error" });
          return;
      }
      
      setLoading(true);
      try {
          // Préparation du payload et retrait de school_id si vide
          const { school_id, ...rest } = form;
          const payload: any = { ...rest };
          if (school_id) payload.school_id = school_id;

          const res = await userService.create(payload);
          
          if (res.success) {
              // Récupération des credentials pour envoi email
              // La structure API est { success: true, data: { user: {...}, credentials: {...} } }
              const data = res.data;
              let emailSent = false;
              let passwordGenerated = "";

              if (data && data.credentials) {
                  const items = data.credentials;
                  passwordGenerated = items.password;
                  // Envoi email
                  const emailRes = await sendUserCredentials(
                      items.email, 
                      items.phone || "", 
                      items.password, 
                      form.name, 
                      roles.find(r => r.value === form.role)?.label || form.role
                  );
                  if (emailRes.success) emailSent = true;
              }
              
              const successMsg = emailSent 
                ? `Utilisateur créé avec succès. Un email contenant les identifiants a été envoyé à ${form.email}`
                : `Utilisateur créé avec succès. ${passwordGenerated ? `Notez le mot de passe : ${passwordGenerated}` : ''}`;
              
              openModal({ 
                  title: "Succès", 
                  description: successMsg, 
                  variant: "success" 
              });
              
              // Reset form
              setForm({ name: "", email: "", phone: "", role: "", school_id: "" });
          }
      } catch (e: any) {
          console.error(e);
          const msg = e.response?.data?.message || "Erreur lors de la création";
          openModal({ title: "Erreur", description: msg, variant: "error" });
      } finally {
          setLoading(false);
      }
  }

  return (
    <ComponentCard title="Informations de l'utilisateur">
       <div className="space-y-6">
          <div>
            <Label>Nom complet *</Label>
            <Input 
                placeholder="Ex: Jean Dupont" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
            />
          </div>
          
          <div>
            <Label>Email *</Label>
            <Input 
                type="email"
                placeholder="email@exemple.com"
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          <div>
            <Label>Téléphone</Label>
            <Input 
                placeholder="07000000"
                value={form.phone} 
                onChange={(e) => setForm({...form, phone: e.target.value})}
            />
          </div>

          <div>
            <Label>Rôle *</Label>
            <Select
                options={roles}
                placeholder="Sélectionner un rôle"
                onChange={(val) => setForm({...form, role: val})}
                className="dark:bg-dark-900"
            />
          </div>
          
          {isAdmin && (
             <div>
                <Label>École (Optionnel/Requis pour Directeur)</Label>
                <Select
                    options={schools}
                    placeholder="Sélectionner une école"
                    onChange={(val) => setForm({...form, school_id: val})}
                    className="dark:bg-dark-900"
                />
             </div>
          )}
          
          <div className="pt-4">
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Création en cours..." : "Créer l'utilisateur"}
              </Button>
          </div>
       </div>
    </ComponentCard>
  );
}
