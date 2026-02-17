// ============================================================================
// Hook: Push Notifications con Firebase Cloud Messaging
// Gestisce: richiesta permessi, token FCM, notifiche in foreground
// Include workaround iOS per PWA standalone
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { db, getFirebaseMessaging, arrayUnion, arrayRemove } from '../firebase';

// TODO: Sostituisci con la tua VAPID key
// La trovi in: Firebase Console > Messaggistica cloud > Certificati push web > Coppia di chiavi
const VAPID_KEY = "TODO_LA_TUA_VAPID_KEY";

interface UseNotificationsOptions {
  userId: string | null;
  onMessage?: (payload: any) => void;
}

export function useNotifications({ userId, onMessage }: UseNotificationsOptions) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Rileva iOS e modalita' standalone
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    typeof window !== 'undefined' &&
    ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone === true);

  // Richiedi permesso e ottieni il token FCM
  const requestPermission = useCallback(async () => {
    if (!userId) return null;

    // Su iOS, le notifiche funzionano solo se l'app e' installata da Home Screen
    if (isIOS && !isStandalone) {
      console.warn("Su iOS le notifiche push funzionano solo dopo l'installazione dalla schermata Home.");
      return null;
    }

    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setLoading(false);
        return null;
      }

      const messaging = getFirebaseMessaging();
      if (!messaging) {
        setLoading(false);
        return null;
      }

      // IMPORTANTE: passare serviceWorkerRegistration esplicitamente
      // Questo fix e' necessario su Android per evitare errori
      const registration = await navigator.serviceWorker.ready;
      const fcmToken = await messaging.getToken({
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (fcmToken) {
        // Salva il token nel documento utente su Firestore
        await db.collection('users').doc(userId).update({
          fcmTokens: arrayUnion(fcmToken)
        });
        setToken(fcmToken);
      }

      setLoading(false);
      return fcmToken;
    } catch (error) {
      console.error("Errore nella richiesta delle notifiche:", error);
      setLoading(false);
      return null;
    }
  }, [userId, isIOS, isStandalone]);

  // Listener per notifiche in foreground (quando l'app e' aperta)
  useEffect(() => {
    if (!onMessage) return;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const unsubscribe = messaging.onMessage((payload: any) => {
      console.log("Notifica ricevuta in foreground:", payload);
      onMessage(payload);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [onMessage]);

  // Rimuovi il token quando l'utente fa logout
  const removeToken = useCallback(async () => {
    if (!userId || !token) return;

    try {
      await db.collection('users').doc(userId).update({
        fcmTokens: arrayRemove(token)
      });
      setToken(null);
    } catch (error) {
      console.error("Errore nella rimozione del token FCM:", error);
    }
  }, [userId, token]);

  return {
    permission,
    token,
    loading,
    isIOS,
    isStandalone,
    requestPermission,
    removeToken
  };
}
