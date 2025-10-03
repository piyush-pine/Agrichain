'use client';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, DocumentData, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useFirestore } from '../provider';

// Extend the user object to include a 'role'
export type AppUser = User &
  DocumentData & {
    role?: string;
  };

type UserState = {
  user: AppUser | null;
  loading: boolean;
};

const UserContext = createContext<UserState | null>(null);

/**
 * A provider that makes the current user available to its children.
 *
 * This provider listens for changes to the authentication state and updates
 * the user context accordingly. It also fetches the user's profile from
 * Firestore and merges it with the user object, including the user's role.
 *
 * You can use the `useUser` hook to access the current user.
 *
 * This provider must be used within a `FirebaseProvider` component.
 */
export const UserProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userState, setUserState] = useState<UserState>({
    user: null,
    loading: true,
  });

  const auth = useAuth();
  const db = useFirestore();

  useEffect(() => {
    if (!auth || !db) {
      setUserState({ user: null, loading: false });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, now fetch their role from Firestore.
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Combine the auth user object with the Firestore data
            setUserState({
              user: { ...user, ...userData, role: userData.role },
              loading: false,
            });
          } else {
            // Firestore document doesn't exist, but user is authenticated.
            // This might happen briefly during registration.
            setUserState({ user: { ...user, role: undefined }, loading: false });
          }
        } catch (error) {
           // Handle error fetching user document
           console.error("Error fetching user data:", error);
           setUserState({ user, loading: false });
        }
      } else {
        // User is signed out.
        setUserState({ user: null, loading: false });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, db]);

  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  );
};

/**
 * A hook that returns the current user, their role, and loading state.
 *
 * This hook must be used within a `UserProvider` component.
 */
export const useUser = (): UserState => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider.');
  }
  return context;
};
