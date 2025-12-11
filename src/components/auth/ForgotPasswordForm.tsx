import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useCustomModal } from "../../context/ModalContext";
import authService from "../../api/services/authService";
import { sendPasswordResetOtp } from "../../api/services/emailService";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { openModal } = useCustomModal();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        openModal({ title: "Erreur", description: "Veuillez entrer votre email.", variant: "error" });
        return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
         // Envoyer OTP par email
         const { otp, name } = res.data;
         
         const emailRes = await sendPasswordResetOtp(email, otp, name);
         
         if (emailRes.success) {
            openModal({
                title: "Email envoyé",
                description: "Un code de vérification a été envoyé à votre adresse email.",
                variant: "success"
            });
            // Rediriger vers reset page avec l'email en state
            navigate("/reset-password", { state: { email } });
         } else {
             openModal({
                title: "Erreur d'envoi",
                description: "Impossible d'envoyer l'email : " + (emailRes.error || "Erreur inconnue"),
                variant: "error"
             });
         }
      } else {
         openModal({ title: "Erreur", description: res.message || "Erreur inconnue", variant: "error" });
      }
    } catch (e: any) {
       console.error(e);
       const msg = e.response?.data?.message || "Une erreur est survenue.";
       openModal({ title: "Erreur", description: msg, variant: "error" });
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto mt-10">
        <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mot de passe oublié</h1>
            <p className="text-sm text-gray-500 mt-2">Entrez votre email pour recevoir un code de réinitialisation.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label>Adresse Email *</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@exemple.com" />
            </div>
            <Button className="w-full" disabled={loading} type="submit">
                {loading ? "Envoi..." : "Envoyer le code"}
            </Button>
            <div className="text-center">
                <Link to="/signin" className="text-sm text-brand-500 hover:underline">Retour à la connexion</Link>
            </div>
        </form>
      </div>
    </div>
  );
}
