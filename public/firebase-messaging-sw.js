// ============================================================================
// SERVICE WORKER - PWA Template
// Gestisce: Firebase Messaging in background, caching offline, click notifiche
// ============================================================================

// --- 1. Firebase Messaging: Inizializzazione ---
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// TODO: Sostituisci con la tua configurazione Firebase
const firebaseConfig = {
  apiKey: "TODO_API_KEY",
  authDomain: "TODO_PROJECT_ID.firebaseapp.com",
  projectId: "TODO_PROJECT_ID",
  storageBucket: "TODO_PROJECT_ID.appspot.com",
  messagingSenderId: "TODO_SENDER_ID",
  appId: "TODO_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// --- 2. Notifiche in Background ---
// Quando l'app e' chiusa o in background, questo handler gestisce le notifiche push
messaging.onBackgroundMessage((payload) => {
  console.log("[Service Worker] Notifica in background ricevuta:", payload);
  // Il browser mostra automaticamente la notifica se il payload contiene "notification"
  return;
});

// --- 3. Click sulla Notifica ---
// Quando l'utente clicca su una notifica, apre l'app o la porta in primo piano
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Click sulla notifica.');
  event.notification.close();

  // Legge l'URL da aprire dai dati della notifica
  const urlToOpen = new URL(
    event.notification.data?.url || event.notification.data?.click_action || './',
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se l'app e' gia' aperta in un tab, la porta in primo piano
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if (client.navigate) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      // Altrimenti apre una nuova finestra
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// --- 4. Caching Offline ---
// TODO: Incrementa la versione quando fai modifiche al service worker
const CACHE_NAME = 'app-cache-v1';
const OFFLINE_URL = '/offline.html';

// Asset da precaricare nella cache all'installazione
const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/',
  '/index.html',
  '/firebase-messaging-sw.js'
];

// Install: precache degli asset essenziali
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn("Cache addAll fallito per alcuni item:", err);
        });
      })
  );
  // Forza l'attivazione immediata (scavalca SW vecchi)
  self.skipWaiting();
});

// Activate: pulisce le cache vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('Service Worker: Pulizia cache vecchia:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  // Prende il controllo di tutti i client immediatamente
  self.clients.claim();
});

// Fetch: strategia di caching
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    // Navigazione: network-first con fallback alla pagina offline
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else if (ASSETS_TO_CACHE.some(asset => event.request.url.endsWith(asset))) {
    // Asset statici: cache-first (icone, pagina offline)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
  // Tutto il resto: network-only (garantisce codice sempre aggiornato)
});
