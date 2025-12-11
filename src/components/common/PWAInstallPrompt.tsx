import { useState, useEffect } from 'react';
import Button from '../ui/button/Button';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto mb-6 overflow-hidden bg-white border border-indigo-100 shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full shrink-0 dark:bg-indigo-900/30">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
              Installer l'application
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Installez AcademiaPro sur votre appareil pour une meilleure expérience et un accès rapide.
            </p>
            <div className="flex gap-3">
                <Button size="sm" onClick={handleInstallClick} className="w-full sm:w-auto">
                    Installer maintenant
                </Button>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    Plus tard
                </button>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-500 focus:outline-none dark:hover:text-gray-300"
          >
            <span className="sr-only">Fermer</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
