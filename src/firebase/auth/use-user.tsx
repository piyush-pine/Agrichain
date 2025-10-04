
'use client';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, DocumentData, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useFirestore } from '../provider';

export type AppUser = User &
  DocumentData & {
    role?: string;
  };

type UserState = {
  user: AppUser | null;
  loading: boolean;
};

const UserContext = createContext<UserState | null>(null);

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

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in. Now, set up a real-time listener for their profile.
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUserState({
                user: { ...user, ...userData, role: userData.role },
                loading: false,
              });
            } else {
              // This case can happen briefly during registration before the user doc is created.
              // Also handles cases where profile doesn't exist yet but user is authenticated.
              setUserState({ user: { ...user, role: undefined }, loading: false });
            }
          },
          (error) => {
            // Firestore permission denied or other error (e.g., offline). Gracefully handle it.
            // User is still authenticated via Firebase Auth.
            console.warn("Could not fetch user profile from Firestore. User may be offline or rules may prevent access.", error.code);
            setUserState({ user: { ...user, role: undefined }, loading: false });
          }
        );

        // Return a cleanup function for the profile listener.
        return () => unsubscribeProfile();
      } else {
        // User is signed out.
        setUserState({ user: null, loading: false });
      }
    });

    // Cleanup auth subscription on unmount
    return () => unsubscribeAuth();
  }, [auth, db]);

  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  );
};

export const useUser = (): UserState => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider.');
  }
  return context;
};
