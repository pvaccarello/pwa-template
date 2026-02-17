# PWA Template - React + Firebase + Vite

Template pronto all'uso per creare Progressive Web App funzionanti su **Android** e **iOS**, con Firebase completo (Auth, Firestore, Storage, Cloud Messaging, Cloud Functions).

## Quick Start

```bash
# 1. Copia questa cartella e rinominala
cp -r pwa-template my-new-app
cd my-new-app

# 2. Installa le dipendenze
npm install
cd functions && npm install && cd ..

# 3. Configura Firebase (vedi checklist sotto)

# 4. Avvia in sviluppo
npm run dev
```

## Checklist Setup Firebase

### 1. Crea progetto Firebase
- Vai su [Firebase Console](https://console.firebase.google.com/)
- Crea un nuovo progetto
- Attiva **Authentication** (Email/Password)
- Attiva **Firestore Database**
- Attiva **Storage**
- Attiva **Cloud Messaging**

### 2. Ottieni la configurazione
- Firebase Console → Impostazioni progetto → Le tue app → Aggiungi app web
- Copia i valori della configurazione

### 3. Sostituisci i placeholder `TODO`
Cerca `TODO` in tutti i file. I file principali da aggiornare sono:

| File | Cosa cambiare |
|------|--------------|
| `src/firebase.ts` | `firebaseConfig` con i tuoi valori |
| `public/firebase-messaging-sw.js` | `firebaseConfig` (stessi valori) |
| `src/hooks/useNotifications.ts` | `VAPID_KEY` (vedi punto 4) |
| `.firebaserc` | ID del tuo progetto Firebase |
| `manifest.json` | Nome app, descrizione, colori |
| `index.html` | Titolo, apple-mobile-web-app-title |
| `offline.html` | Messaggio offline personalizzato |

### 4. Ottieni la VAPID Key
- Firebase Console → Messaggistica cloud → Certificati push web
- Genera una coppia di chiavi
- Copia la **chiave pubblica** in `useNotifications.ts`

### 5. Icone
- Crea icone PNG: **192x192** e **512x512** pixel
- Mettile in `public/icons/`
- Strumenti consigliati: [PWA Image Generator](https://www.pwabuilder.com/imageGenerator)

## Comandi

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia dev server locale |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Preview della build |
| `npm run test` | Esegui i test |
| `npm run deploy` | Build + deploy su Firebase Hosting |
| `cd functions && npm run deploy` | Deploy Cloud Functions |

## Struttura del Progetto

```
src/
├── firebase.ts              # Init Firebase + iOS messaging workaround
├── types.ts                 # Tipi TypeScript
├── contexts/
│   ├── PWAContext.tsx        # Install prompt (beforeinstallprompt)
│   └── ToastContext.tsx      # Notifiche in-app
├── hooks/
│   ├── useAuth.ts           # Auth + profilo Firestore real-time
│   ├── useLocalStorage.ts   # Persistenza locale
│   └── useNotifications.ts  # FCM: permessi, token, foreground
├── components/
│   ├── Header.tsx           # Header con bottone "Installa App"
│   ├── InstallBanner.tsx    # Banner installazione iOS/Android
│   └── common/              # Button, Toast, Modal
├── pages/
│   ├── LoginPage.tsx        # Auth con email/password
│   └── HomePage.tsx         # Home con attivazione notifiche
functions/
└── index.js                 # Cloud Function per push notifications
public/
├── firebase-messaging-sw.js # Service Worker (FCM + caching)
└── icons/                   # Icone PWA
```

## Note iOS vs Android

### Android / Desktop Chrome
- L'installazione avviene tramite `beforeinstallprompt` (gestito da `PWAContext`)
- Il bottone "Installa App" appare automaticamente
- Le notifiche push funzionano subito dopo il permesso

### iOS (iPhone/iPad)
- **Non esiste** `beforeinstallprompt` su Safari/iOS
- L'utente deve installare manualmente: Condividi → "Aggiungi a schermata Home"
- Il componente `InstallBanner` mostra le istruzioni
- Le notifiche push funzionano **solo** dopo l'installazione da Home Screen
- `getFirebaseMessaging()` in `firebase.ts` contiene il workaround per iOS standalone

## Caching Strategy (Service Worker)

| Tipo di richiesta | Strategia | Motivo |
|-------------------|-----------|--------|
| Navigazione | Network-first + offline fallback | L'utente riceve sempre l'ultima versione |
| Asset statici (icone) | Cache-first | Non cambiano spesso |
| Tutto il resto | Network-only | Garantisce codice sempre aggiornato |

## Deploy

```bash
# Build + deploy hosting e functions
npm run build
firebase deploy

# Solo hosting
firebase deploy --only hosting

# Solo functions
firebase deploy --only functions
```

## Cosa include questo template

- [x] Manifest PWA completo (Android + iOS)
- [x] Service Worker con caching offline
- [x] Push notifications (FCM) con Cloud Functions
- [x] Workaround iOS per notifiche in standalone mode
- [x] Install prompt automatico (Android) + istruzioni manuali (iOS)
- [x] Firebase Auth con email verification
- [x] Firestore con persistenza offline
- [x] Firebase Storage
- [x] Componenti UI base (Button, Toast, Modal) con dark mode
- [x] Headers no-cache per SW e manifest (evita problemi di aggiornamento)
- [x] Setup test con Vitest + mock Firebase
- [x] TypeScript
- [x] Tailwind CSS
