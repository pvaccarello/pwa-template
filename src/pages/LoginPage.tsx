// ============================================================================
// Pagina di Login - Template base con Firebase Auth
// TODO: Personalizza con i campi e lo stile della tua app
// ============================================================================

import React, { useState } from 'react';
import { auth, db } from '../firebase';
import Button from '../components/common/Button';
import { useToast } from '../contexts/ToastContext';
import { usePWA } from '../contexts/PWAContext';

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { isInstallable, installApp } = usePWA();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // Registrazione
        const credential = await auth.createUserWithEmailAndPassword(email, password);
        // Invia email di verifica
        await credential.user.sendEmailVerification();
        // Crea documento utente su Firestore
        await db.collection('users').doc(credential.user.uid).set({
          email: credential.user.email,
          role: 'user',
          profileCompleted: false,
          createdAt: new Date()
        });
        addToast('Registrazione completata! Controlla la tua email per la verifica.', 'success');
        await auth.signOut();
      } else {
        // Login
        const credential = await auth.signInWithEmailAndPassword(email, password);
        if (!credential.user.emailVerified) {
          addToast('Devi verificare la tua email prima di accedere.', 'warning');
          await auth.signOut();
        }
      }
    } catch (error: any) {
      const messages: Record<string, string> = {
        'auth/user-not-found': 'Utente non trovato.',
        'auth/wrong-password': 'Password errata.',
        'auth/email-already-in-use': 'Email gia\' registrata.',
        'auth/weak-password': 'La password deve avere almeno 6 caratteri.',
        'auth/invalid-email': 'Email non valida.',
      };
      addToast(messages[error.code] || error.message, 'error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* TODO: Sostituisci con il logo della tua app */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {/* TODO: Cambia il nome dell'app */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-4">My PWA App</h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
            {isRegistering ? 'Registrati' : 'Accedi'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full">
              {isRegistering ? 'Registrati' : 'Accedi'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isRegistering ? 'Hai gia\' un account? Accedi' : 'Non hai un account? Registrati'}
            </button>
          </div>
        </div>

        {/* Bottone installazione sulla pagina di login */}
        {isInstallable && (
          <div className="mt-4 text-center">
            <Button variant="secondary" onClick={installApp}>
              Installa App
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
