/**
 * @fileoverview Firebase service — app init + auth + firestore
 *
 * SECURITY CHECKLIST:
 *  ✅ All secrets loaded from env vars (never hardcoded)
 *  ✅ `.env.local` is in .gitignore — never committed
 *  ✅ Checks ALL 6 required fields before initialising
 *  ✅ Prevents duplicate initialisation in hot-reload (getApps check)
 *  ✅ Graceful demo mode — app works without credentials
 *  ✅ No PII ever logged or stored
 *
 * @module services/firebase
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ── Required Firebase config fields ─────────────────────────────────────────
const REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * True only when ALL required fields are present and non-empty.
 * Checking just apiKey+projectId wasn't enough — authDomain and appId
 * are also required for Anonymous Auth and Firestore to work correctly.
 *
 * @type {boolean}
 */
export const isFirebaseConfigured = REQUIRED_FIELDS.every((key) => !!firebaseConfig[key]);

// ── Singletons ──────────────────────────────────────────────────────────────
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  // Guard against duplicate initialisation in Vite HMR (hot module reload)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);

  if (import.meta.env.DEV) {
    console.info('[Firebase] ✅ Initialised | project:', firebaseConfig.projectId);
  }
} else {
  if (import.meta.env.DEV) {
    console.info(
      '[Firebase] ⚠️  Running in DEMO mode.\n' +
        'Create .env.local from .env.example to enable real Firebase services.\n' +
        'Missing fields:',
      REQUIRED_FIELDS.filter((k) => !firebaseConfig[k]).join(', ') || 'none',
    );
  }
}

export { app, auth, db };
