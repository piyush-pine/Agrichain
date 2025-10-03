'use client';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, DocumentData, getDoc, getFirestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../provider';

type UserState = {
  user: (User & DocumentData) | null;
  loading: boolean;
};

const UserContext = createContext<UserState | null>(null);

/**
 * A provider that makes the current user available to its children.
 *
 * This provider listens for changes to the authentication state and updates
 * the user context accordingly. It also fetches the user's profile from
 * Firestore and merges it with the user object.
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
  const db = getFirestore(auth.app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserState({
            user: { ...user, ...userDoc.data() },
            loading: false,
          });
        } else {
          setUserState({ user, loading: false });
        }
      } else {
        setUserState({ user: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  );
};

/**
 * A hook that returns the current user.
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
