// ============================================================================
// Cloud Function: Push Notifications Template
// Pattern: trigger su creazione documento → query utenti target → invio multicast
//
// Come funziona:
// 1. Il client crea un documento in "notificationQueue" con i dati della notifica
// 2. Questa funzione si attiva automaticamente
// 3. Raccoglie i token FCM degli utenti target
// 4. Invia la notifica push a tutti i dispositivi
// 5. Pulisce i token invalidi
// ============================================================================

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNotification = onDocumentCreated({
  // TODO: Cambia il path della collection se necessario
  document: "notificationQueue/{jobId}",
  // TODO: Cambia la regione se necessario
  region: "europe-west1"
}, async (event) => {
  const snap = event.data;
  const jobId = event.params.jobId;

  if (!snap) {
    console.error(`[Job ${jobId}] Snapshot non disponibile.`);
    return;
  }

  const jobData = snap.data();
  const db = admin.firestore();

  // TODO: Personalizza la logica di targeting
  // Esempio: recupera i dati dell'entita' collegata alla notifica
  // const entityRef = db.collection("your_collection").doc(jobData.entityId);
  // const entityDoc = await entityRef.get();

  // --- 1. Raccogli i token degli utenti target ---
  const tokens = new Set();

  // TODO: Personalizza la query per selezionare gli utenti destinatari
  // Esempio: tutti gli utenti con un certo campo
  const usersQuery = db.collection("users")
    .where("role", "==", "user");

  const usersSnapshot = await usersQuery.get();
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    if (user.fcmTokens && user.fcmTokens.length > 0) {
      user.fcmTokens.forEach(token => tokens.add(token));
    }
  });

  const tokenList = Array.from(tokens);
  if (tokenList.length === 0) {
    console.log(`[Job ${jobId}] Nessun token trovato. Fine.`);
    return snap.ref.delete();
  }

  // --- 2. Costruisci e invia la notifica ---
  const baseUrl = process.env.WEBAPP_URL || `https://${process.env.GCLOUD_PROJECT}.web.app`;

  // TODO: Personalizza titolo, corpo e URL della notifica
  const message = {
    notification: {
      title: jobData.title || "Nuova notifica",
      body: jobData.body || "Hai ricevuto un aggiornamento.",
    },
    webpush: {
      headers: { Urgency: "high" },
      notification: {
        icon: `${baseUrl}/icons/icon-192x192.png`,
        badge: `${baseUrl}/icons/icon-192x192.png`,
        requireInteraction: true,
        tag: `notification:${jobId}`,
        data: {
          url: jobData.url || baseUrl,
          click_action: jobData.url || baseUrl
        }
      },
      fcmOptions: {
        link: jobData.url || baseUrl,
      },
    },
    data: {
      url: jobData.url || baseUrl,
      click_action: jobData.url || baseUrl
    },
    tokens: tokenList,
  };

  console.log(`[Job ${jobId}] Invio a ${tokenList.length} dispositivi.`);

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[Job ${jobId}] ${response.successCount} inviati, ${response.failureCount} falliti.`);

    // --- 3. Pulizia token invalidi ---
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-argument') {
            invalidTokens.push(tokenList[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        console.log(`[Job ${jobId}] Rimozione ${invalidTokens.length} token invalidi...`);
        const batch = db.batch();
        // Firestore limita array-contains-any a 10 elementi
        const usersSnap = await db.collection('users')
          .where('fcmTokens', 'array-contains-any', invalidTokens.slice(0, 10))
          .get();

        usersSnap.forEach(doc => {
          const userData = doc.data();
          const cleanedTokens = (userData.fcmTokens || []).filter(
            t => !invalidTokens.includes(t)
          );
          batch.update(doc.ref, { fcmTokens: cleanedTokens });
        });
        await batch.commit();
      }
    }
  } catch (error) {
    console.error(`[Job ${jobId}] Errore invio:`, error.code, error.message);
  }

  // --- 4. Rimuovi il job dalla coda ---
  return snap.ref.delete();
});
