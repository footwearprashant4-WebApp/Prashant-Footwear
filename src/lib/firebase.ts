import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress internal connection/retry logs from Firestore SDK when operating in offline/quota backoff mode
setLogLevel('silent');

const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with local cache persistence for seamless offline mode
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errStr = error instanceof Error ? error.message : String(error);
  const isQuota = errStr.includes('resource-exhausted') || errStr.includes('Quota limit exceeded') || errStr.includes('quota');
  const isUnavailable = errStr.includes('unavailable') || errStr.includes('Could not reach Cloud Firestore backend') || errStr.includes('offline');

  if (isQuota) {
    console.warn(`[Firestore Quota Notice] ${operationType} on ${path || 'database'} reached daily limit. Operating in local cache mode.`);
    throw new Error('Firestore daily write quota reached. Changes saved in local browser session.');
  }

  if (isUnavailable) {
    console.warn(`[Firestore Offline Notice] ${operationType} on ${path || 'database'} - backend temporarily unreachable. Client operating in offline cache mode.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error Details:', errStr);
  throw new Error(errStr);
}
