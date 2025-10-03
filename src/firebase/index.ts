import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';

/**
 * Initializes the Firebase app and returns the app, auth, and firestore instances.
 *
 * This function is idempotent and will only initialize the app once. If the app
 * has already been initialized, it will return the existing instances.
 *
 * This function should be used in the `FirebaseClientProvider` to ensure that
 * Firebase is initialized once and that the same instance is used across
 * server and client components.
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}

export { FirebaseClientProvider } from './client-provider';
export {
  FirebaseProvider,
  useAuth,
  useFirebase,
  useFirebaseApp,
  useFirestore,
} from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { FirestorePermissionError } from './errors';
export type { SecurityRuleContext } from './errors';
