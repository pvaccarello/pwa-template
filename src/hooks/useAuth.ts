// ============================================================================
// Hook: Firebase Auth con profilo Firestore in tempo reale
// Ascolta i cambiamenti di autenticazione e carica il profilo utente
// ============================================================================

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore: () => void = () => {};

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser: any) => {
      // Cancella listener Firestore precedente
      unsubscribeFirestore();

      if (firebaseUser && firebaseUser.emailVerified) {
        setLoading(true);
        const userDocRef = db.collection('users').doc(firebaseUser.uid);

        // Listener in tempo reale: il profilo si aggiorna automaticamente
        unsubscribeFirestore = userDocRef.onSnapshot(
          (docSnap: any) => {
            if (docSnap.exists) {
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                ...docSnap.data()
              } as User);
            } else {
              setUser(null);
            }
            setLoading(false);
          },
          (error: any) => {
            console.error("Errore nel caricamento profilo utente:", error);
            setUser(null);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  return { user, loading };
}
