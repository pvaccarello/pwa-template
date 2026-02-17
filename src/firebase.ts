// ============================================================================
// Firebase: Inizializzazione e servizi
// Usa l'API "compat" caricata via CDN in index.html (non serve npm install)
// ============================================================================

declare const firebase: any;

// TODO: Sostituisci con la configurazione del tuo progetto Firebase
// La trovi in: Firebase Console > Impostazioni progetto > Le tue app > Config
const firebaseConfig = {
  apiKey: "TODO_API_KEY",
  authDomain: "TODO_PROJECT_ID.firebaseapp.com",
  projectId: "TODO_PROJECT_ID",
  storageBucket: "TODO_PROJECT_ID.appspot.com",
  messagingSenderId: "TODO_SENDER_ID",
  appId: "TODO_APP_ID",
  measurementId: "TODO_MEASUREMENT_ID"
};

// Inizializza Firebase (evita doppia inizializzazione)
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// --- Servizi Firebase ---
export const db = firebase.firestore(app);
export const auth = firebase.auth(app);
export const storage = firebase.storage(app);

// --- Firestore: Abilita persistenza offline ---
// I dati vengono salvati localmente e sincronizzati quando torna la rete
db.enablePersistence()
  .catch((err: any) => {
    if (err.code == 'failed-precondition') {
      // Succede se l'app e' aperta in piu' tab contemporaneamente
      console.warn('Firestore persistence fallita: app aperta in piu\' tab.');
    } else if (err.code == 'unimplemented') {
      // Il browser non supporta la persistenza (es. navigazione privata)
      console.warn('Firestore persistence non supportata in questo browser.');
    }
  });

// --- Firestore: Helper per campi speciali ---
export const Timestamp = firebase.firestore.Timestamp;
export type Timestamp = InstanceType<typeof firebase.firestore.Timestamp>;
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
export const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
export const deleteField = firebase.firestore.FieldValue.delete;

// --- Firebase Messaging: Con supporto iOS ---
// Questa funzione gestisce i casi speciali di iOS dove messaging.isSupported()
// ritorna false anche quando le notifiche funzionerebbero in modalita' standalone
let messagingInstance: any | null = null;
export const getFirebaseMessaging = (): any | null => {
  if (messagingInstance) return messagingInstance;

  try {
    const anyFirebase = firebase as any;

    // Rileva iOS e modalita' standalone (installata da home screen)
    const isIOS =
      typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      typeof window !== 'undefined' &&
      ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator as any).standalone === true);

    // Su iOS standalone, bypassa il check isSupported() perche' le notifiche funzionano
    const shouldBypassSupportCheck =
      isIOS && isStandalone && typeof Notification !== 'undefined' && 'serviceWorker' in navigator;

    if (
      typeof anyFirebase?.messaging?.isSupported === 'function' &&
      !anyFirebase.messaging.isSupported() &&
      !shouldBypassSupportCheck
    ) {
      return null;
    }

    messagingInstance = firebase.messaging(app);
    return messagingInstance;
  } catch (err) {
    console.error("Errore durante l'inizializzazione di Firebase Messaging:", err);
    return null;
  }
};
