// ============================================================================
// Banner di installazione PWA
// Mostra istruzioni diverse per iOS (manuale) e Android/Desktop (automatico)
// ============================================================================

import React, { useState } from 'react';
import { usePWA } from '../contexts/PWAContext';
import Button from './common/Button';

const InstallBanner: React.FC = () => {
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Non mostrare se gia' installata o se l'utente ha chiuso il banner
  if (isStandalone || dismissed) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Su Android/Desktop: mostra il bottone di installazione nativo
  if (isInstallable) {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-500 dark:bg-opacity-10 border border-indigo-200 dark:border-indigo-500 dark:border-opacity-20 rounded-xl p-4 mx-4 mt-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-indigo-900 dark:text-indigo-300">Installa l'app</p>
          <p className="text-sm text-indigo-700 dark:text-indigo-400">Aggiungila alla schermata Home per un accesso rapido</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setDismissed(true)}>No grazie</Button>
          <Button variant="primary" onClick={installApp}>Installa</Button>
        </div>
      </div>
    );
  }

  // Su iOS: mostra le istruzioni manuali (iOS non supporta beforeinstallprompt)
  if (isIOS) {
    return (
      <div className="bg-blue-50 dark:bg-blue-500 dark:bg-opacity-10 border border-blue-200 dark:border-blue-500 dark:border-opacity-20 rounded-xl p-4 mx-4 mt-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-300">Installa su iPhone/iPad</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Tocca il pulsante <strong>Condividi</strong> (icona quadrato con freccia) e poi <strong>"Aggiungi a schermata Home"</strong>
            </p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-blue-400 hover:text-blue-600 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallBanner;
