import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useCustomModal } from "../../context/ModalContext";
import authService from "../../api/services/authService";
import { EyeCloseIcon, EyeIcon } from "../../icons";

export default function ResetPasswordForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useCustomModal();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (location.state && location.state.email) {
          setEmail(location.state.email);
      }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !otp || !password) {
          openModal({ title: "Erreur", description: "Tous les champs sont requis.", variant: "error" });
          return;
      }
      
      setLoading(true);
      try {
          const res = await authService.resetPassword({ email, otp, password });
          if (res.success) {
              openModal({ 
                  title: "Succès", 
                  description: "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.", 
                  variant: "success",
                  primaryAction: () => navigate("/signin")
              });
              // Nous ne naviguons pas immédiatement pour laisser le temps de lire le modal, 
              // mais l'utilisateur peut fermer ou cliquer sur l'action primaire.
              // On peut forcer après délai si voulu.
              setTimeout(() => navigate("/signin"), 3000);
          } else {
              openModal({ title: "Erreur", description: res.message || "Code invalide ou expiré.", variant: "error" });
          }
      } catch (e: any) {
          console.error(e);
          const msg = e.response?.data?.message || "Erreur technique.";
          openModal({ title: "Erreur", description: msg, variant: "error" });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto mt-10">
        <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Réinitialisation</h1>
            <p className="text-sm text-gray-500 mt-2">Entrez le code reçu par email et votre nouveau mot de passe.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@exemple.com" />
            </div>
            
            <div>
                <Label>Code de vérification (OTP)</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
            </div>

            <div>
                <Label>Nouveau mot de passe</Label>
                <div className="relative">
                    <Input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="Nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                </div>
            </div>

            <Button className="w-full" disabled={loading} type="submit">
                {loading ? "Validation..." : "Changer le mot de passe"}
            </Button>
            
             <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-brand-500 hover:underline">Renvoyer le code</Link>
            </div>
        </form>
      </div>
    </div>
  );
}
