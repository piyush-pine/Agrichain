'use client';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
  query,
} from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';

import { useFirestore } from '../provider';

type CollectionState<T> = {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
};

/**
 * A hook that listens for changes to a Firestore collection.
 *
 * This hook must be used within a `FirebaseProvider` component.
 */
export function useCollection<T extends DocumentData>(
  collectionName: string
): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const db = useFirestore();

  const collectionQuery = useMemo(
    () => query(collection(db, collectionName)),
    [db, collectionName]
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const data: T[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setState({ data, loading: false, error: null });
      },
      (error) => {
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [collectionQuery]);

  return state;
}
