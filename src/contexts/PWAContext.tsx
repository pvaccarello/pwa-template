// ============================================================================
// PWA Context: Gestisce l'installazione dell'app
// - Cattura l'evento beforeinstallprompt (Android/Desktop Chrome)
// - Espone isInstallable e installApp() per mostrare un bottone di installazione
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PWAContextType {
  deferredPrompt: any;
  isInstallable: boolean;
  isStandalone: boolean;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA deve essere usato dentro un PWAProvider');
  }
  return context;
};

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Rileva se l'app e' gia' installata (standalone mode)
  const isStandalone =
    typeof window !== 'undefined' &&
    ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone === true);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Impedisce la mini-barra di Chrome
      e.preventDefault();
      // Salva l'evento per poterlo triggerare dopo
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    // Mostra il prompt nativo di installazione
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Risposta utente al prompt di installazione: ${outcome}`);

    // Il prompt puo' essere usato una sola volta
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <PWAContext.Provider value={{ deferredPrompt, isInstallable, isStandalone, installApp }}>
      {children}
    </PWAContext.Provider>
  );
};
