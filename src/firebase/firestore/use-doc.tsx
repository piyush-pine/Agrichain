'use client';
import {
  doc,
  onSnapshot,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { useFirestore } from '../provider';

type DocState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

/**
 * A hook that listens for changes to a Firestore document.
 *
 * This hook must be used within a `FirebaseProvider` component.
 */
export function useDoc<T extends DocumentData>(
  collectionName: string,
  docId: string
): DocState<T> {
  const [state, setState] = useState<DocState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const db = useFirestore();

  const docRef = useMemo(
    () => doc(db, collectionName, docId) as DocumentReference<T>,
    [db, collectionName, docId]
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as T;
          setState({ data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: new Error('Document does not exist') });
        }
      },
      (error) => {
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return state;
}
