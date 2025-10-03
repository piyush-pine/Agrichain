'use client';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// `initializeFirebase` may be called multiple times, but `initializeApp` will only be called once.
const { app, auth, firestore } = initializeFirebase();

/**
 * A client-side provider that initializes Firebase and makes it available to its children.
 *
 * This provider should be used at the root of your application to ensure that
 * Firebase is initialized once and that the same instance is used throughout

 * your app. It composes the `FirebaseProvider` to make the Firebase app, auth,
 * and firestore instances available to all child components via the
 * `useFirebase`, `useFirebaseApp`, `useAuth`, and `useFirestore` hooks.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <FirebaseProvider
      app={app}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
};
