// Infrastructure: Firebase Admin SDK initialization for Firestore
import admin from 'firebase-admin';
import { env } from '@infrastructure/config/env';

// Initialize Firebase Admin SDK
// When emulator environment variables are set, Firebase Admin automatically connects to the emulator
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: env.FIREBASE_PROJECT,
    // When running with emulator, no credentials are needed
    // The emulator environment variables (FIRESTORE_EMULATOR_HOST, etc.) handle the connection
    // Firebase Admin SDK automatically detects FIRESTORE_EMULATOR_HOST and connects to the emulator
  });
}

// Get Firestore instance
// Note: When FIRESTORE_EMULATOR_HOST environment variable is set,
// Firebase Admin SDK automatically uses the emulator instead of production Firestore
export const firestore = admin.firestore();

// Export admin for other Firebase services if needed
export { admin };

