import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const ENV_VARS = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

const missing = (Object.keys(ENV_VARS) as (keyof typeof ENV_VARS)[]).filter(k => !ENV_VARS[k]);
if (missing.length > 0) {
  console.error(
    '[Firebase] Missing required environment variables:\n' +
    missing.map(k => `  • ${k}`).join('\n') +
    '\n\nCreate a .env.local file in the project root with these values.\n' +
    'See .env.example for the full template.'
  );
}

let app: FirebaseApp;
let db: Firestore;

try {
  app = initializeApp({
    apiKey: ENV_VARS.VITE_FIREBASE_API_KEY,
    authDomain: ENV_VARS.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: ENV_VARS.VITE_FIREBASE_PROJECT_ID,
    storageBucket: ENV_VARS.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: ENV_VARS.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: ENV_VARS.VITE_FIREBASE_APP_ID,
  });
  db = getFirestore(app);
} catch (err) {
  console.error('[Firebase] Failed to initialize app:', err);
  throw err;
}

export { db };
