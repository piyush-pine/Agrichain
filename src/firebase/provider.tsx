'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { createContext, useContext } from 'react';

/**
 * A context that provides access to the Firebase app, auth, and firestore
 * instances.
 *
 * You can use the `useFirebase`, `useFirebaseApp`, `useAuth`, and
 * `useFirestore` hooks to access the instances.
 */
const FirebaseContext = createContext<{
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null>(null);

/**
 * A provider that makes the Firebase app, auth, and firestore instances
 * available to its children.
 *
 * This provider should be used at the root of your application to ensure that
 * the same Firebase instances are used throughout your app. The `app`, `auth`,
 * and `firestore` instances are created by the `initializeFirebase` function.
 *
 * You should use the `FirebaseClientProvider` in your root layout to ensure
 * that Firebase is initialized once and that the same instance is used across
 * server and client components.
 *
 * @see FirebaseClientProvider
 * @see initializeFirebase
 */
export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}> = ({ children, app, auth, firestore }) => {
  return (
    <FirebaseContext.Provider
      value={{
        app,
        auth,
        firestore,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * A hook that returns the Firebase app, auth, and firestore instances.
 *
 * This hook must be used within a `FirebaseProvider` component.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * A hook that returns the Firebase app instance.
 *
 * This hook must be used within a `FirebaseProvider` component.
 */
export function useFirebaseApp() {
  return useFirebase().app;
}

/**
 * A hook that returns the Firebase auth instance.
 *
 * This hook must be used within a `FirebaseProvider` component.
 */
export function useAuth() {
  return useFirebase().auth;
}

/**
 * A hook that returns the Firebase firestore instance.
 *
 * This hook must be used within a `FirebaseProvider` component.
 */
export function useFirestore() {
  return useFirebase().firestore;
}
