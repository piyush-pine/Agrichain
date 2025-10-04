'use client';

// This file is now primarily a barrel file for exporting Firebase-related hooks and providers.
// The initialization logic has been moved to FirebaseClientProvider for robustness.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
