import { vi } from 'vitest';

// Mock Firebase per i test
// Firebase viene caricato via CDN, quindi dobbiamo mockarlo globalmente
const mockFirestore = {
  collection: vi.fn().mockReturnThis(),
  doc: vi.fn().mockReturnThis(),
  get: vi.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
  set: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  onSnapshot: vi.fn(),
  enablePersistence: vi.fn().mockResolvedValue(undefined),
};

const mockAuth = {
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  currentUser: null,
};

const mockMessaging = {
  getToken: vi.fn().mockResolvedValue('mock-token'),
  onMessage: vi.fn(),
};

const firebaseMock = {
  apps: [],
  initializeApp: vi.fn().mockReturnValue({}),
  app: vi.fn().mockReturnValue({}),
  firestore: Object.assign(vi.fn().mockReturnValue(mockFirestore), {
    Timestamp: { now: vi.fn(), fromDate: vi.fn() },
    FieldValue: {
      serverTimestamp: vi.fn(),
      arrayUnion: vi.fn(),
      arrayRemove: vi.fn(),
      delete: vi.fn(),
    },
  }),
  auth: vi.fn().mockReturnValue(mockAuth),
  storage: vi.fn().mockReturnValue({
    ref: vi.fn().mockReturnThis(),
    put: vi.fn().mockReturnThis(),
    getDownloadURL: vi.fn().mockResolvedValue('http://example.com/image.jpg'),
  }),
  messaging: Object.assign(vi.fn().mockReturnValue(mockMessaging), {
    isSupported: vi.fn().mockReturnValue(true),
  }),
};

(global as any).firebase = firebaseMock;
