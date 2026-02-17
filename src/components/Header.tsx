import React from 'react';
import { auth } from '../firebase';
import Button from './common/Button';
import { usePWA } from '../contexts/PWAContext';

const Header: React.FC = () => {
  const { isInstallable, installApp } = usePWA();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  return (
    <header className="bg-white bg-opacity-80 dark:bg-slate-900 dark:bg-opacity-80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {/* TODO: Sostituisci con il logo/icona della tua app */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {/* TODO: Cambia il titolo */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My PWA App</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bottone "Installa App" - appare solo su Android/Desktop quando l'app e' installabile */}
          {isInstallable && (
            <Button variant="primary" onClick={installApp} className="hidden sm:flex">
              Installa App
            </Button>
          )}
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
