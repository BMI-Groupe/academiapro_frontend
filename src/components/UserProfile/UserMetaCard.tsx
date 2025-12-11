import { useState, useEffect, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import useAuth from "../../providers/auth/useAuth";
import axiosInstance, { STORAGE_URL } from "../../api/axios";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  // @ts-ignore
  const { userInfo, authMe } = useAuth(); // Utiliser userInfo au lieu de userData qui semble être pour autre chose parfois, ou vérifier la cohérence.
  // Dans AuthProvider, userInfo est set initialement, et userData via authMe. 
  // On va utiliser userInfo car c'est ce qui est utilisé ailleurs, mais on rafraichira tout.
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    new_password: "",
    new_password_confirmation: "",
    current_password: ""
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && userInfo) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        new_password: "",
        new_password_confirmation: "",
        current_password: ""
      });
      setPhotoPreview(null);
      setPhotoFile(null);
    }
  }, [isOpen, userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      // Le téléphone n'est pas modifiable, on ne l'envoie pas ou le backend l'ignore
      // data.append('phone', formData.phone);
      
      if (formData.new_password) {
        data.append('new_password', formData.new_password);
        data.append('new_password_confirmation', formData.new_password_confirmation);
        data.append('current_password', formData.current_password);
      }

      if (photoFile) {
        data.append('photo', photoFile);
      }

      const response = await axiosInstance.post('/update-profile', data);

      if (response.data.success) {
        // Rafraîchir les infos utilisateur
        if (authMe) {
             await authMe();
        }
        closeModal();
      } else {
        alert(response.data.message || "Erreur lors de la mise à jour");
      }

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Une erreur est survenue";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Construire l'URL de la photo
  const getPhotoUrl = (path: string | null) => {
    if (!path) return "/images/user/owner.jpg"; // Image par défaut
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path}`;
  };

  if (!userInfo) return null;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img 
                src={getPhotoUrl(userInfo.profile_photo_path)} 
                alt="user" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userInfo.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <div  className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
                  {userInfo.role}
                </div>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 content-center">
                  {userInfo.email}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Modifier le profil
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modifier mes informations
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour vos informations personnelles.
            </p>
          </div>
          
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-3 overflow-hidden rounded-full border border-gray-200">
                    <img 
                        src={photoPreview || getPhotoUrl(userInfo.profile_photo_path)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handlePhotoChange}
                />
                <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Changer la photo
                </Button>
              </div>

              <div className="mt-4">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informations Générales
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Nom complet</Label>
                    <Input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Téléphone (Non modifiable)</Label>
                    <Input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        disabled={true}
                        className="bg-gray-100 dark:bg-gray-800 opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-7 border-t border-gray-200 dark:border-gray-800">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Sécurité (Laisser vide pour ne pas changer)
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                   {formData.new_password && (
                      <div className="col-span-2">
                        <Label>Mot de passe actuel (Requis pour changer)</Label>
                        <Input 
                            type="password" 
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleChange}
                            placeholder="Votre mot de passe actuel"
                        />
                      </div>
                   )}

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nouveau mot de passe</Label>
                    <Input 
                        type="password" 
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Confirmer le mot de passe</Label>
                    <Input 
                        type="password" 
                        name="new_password_confirmation"
                        value={formData.new_password_confirmation}
                        onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Annuler
              </Button>
              <Button size="sm" disabled={loading} type="submit">
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
