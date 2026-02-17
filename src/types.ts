// ============================================================================
// Tipi base - TODO: Personalizza in base alla tua app
// ============================================================================

export interface User {
  id: string;
  email: string;
  role: string;
  profileCompleted?: boolean;
  fcmTokens?: string[];
  [key: string]: any; // Permette campi aggiuntivi dal profilo Firestore
}
