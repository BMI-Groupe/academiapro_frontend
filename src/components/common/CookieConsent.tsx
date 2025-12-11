import { useState, useEffect } from "react";
import Button from "../ui/button/Button";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 md:p-6">
      <div className="flex flex-col items-center justify-between max-w-6xl gap-4 mx-auto md:flex-row">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nous respectons votre vie privée
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Nous utilisons des cookies pour améliorer votre expérience de navigation, 
            sécuriser nos services et analyser notre trafic. En continuant à utiliser 
            ce site, vous acceptez notre utilisation des cookies.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
            {/* Optionnel: Bouton refuser ou paramètres */}
           <Button size="sm" onClick={handleAccept}>
            Accepter et fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
