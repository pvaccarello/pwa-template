import React, { useCallback } from 'react';
import { User } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../contexts/ToastContext';
import InstallBanner from '../components/InstallBanner';
import Button from '../components/common/Button';

interface HomePageProps {
  user: User;
}

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const { addToast } = useToast();

  const handleMessage = useCallback((payload: any) => {
    const title = payload.notification?.title || 'Nuova notifica';
    addToast(title, 'info');
  }, [addToast]);

  const { permission, loading, isIOS, isStandalone, requestPermission } = useNotifications({
    userId: user.id,
    onMessage: handleMessage
  });

  const handleEnableNotifications = async () => {
    if (isIOS && !isStandalone) {
      addToast("Su iPhone/iPad le notifiche funzionano solo dopo l'installazione dalla schermata Home.", 'info');
      return;
    }

    const token = await requestPermission();
    if (token) {
      addToast('Notifiche attivate!', 'success');
    } else if (permission === 'denied') {
      addToast('Permesso notifiche negato. Controlla le impostazioni del browser.', 'warning');
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Banner di installazione PWA */}
      <InstallBanner />

      <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Benvenuto, {user.email}
        </h2>

        {/* Sezione Notifiche Push */}
        {permission !== 'granted' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-500 dark:bg-opacity-10 rounded-xl border border-yellow-200 dark:border-yellow-500 dark:border-opacity-20">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
              Attiva le notifiche push per ricevere aggiornamenti in tempo reale.
            </p>
            <Button variant="primary" onClick={handleEnableNotifications} isLoading={loading}>
              Attiva Notifiche
            </Button>
          </div>
        )}

        {/* TODO: Aggiungi il contenuto della tua app qui */}
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          La tua PWA e' pronta! Inizia a costruire la tua app da qui.
        </p>
      </div>
    </main>
  );
};

export default HomePage;
