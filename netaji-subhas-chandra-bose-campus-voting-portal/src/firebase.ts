import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { VoterProfile, VaultBallot } from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Error Handling conforming strictly to Firebase Skill directives
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory testConnection helper on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
    }
  }
}

// Authentication Service Helpers
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function registerWithEmailPassword(email: string, pass: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

export async function loginWithEmailPassword(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function logoutUser() {
  return await firebaseSignOut(auth);
}

// User Profile Management in Firestore
export async function saveUserProfileToFirestore(voter: VoterProfile): Promise<void> {
  if (!voter.uid) return;
  const path = `users/${voter.uid}`;
  try {
    const userDocRef = doc(db, 'users', voter.uid);
    const payload = {
      userId: voter.uid,
      name: voter.name,
      email: voter.email,
      studentId: voter.studentId,
      departmentId: voter.departmentId,
      year: voter.year,
      collegeIdNumber: voter.collegeIdNumber || `NSCB-ID-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: voter.isVerified ?? true,
      hasVoted: voter.hasVoted ?? false,
      receiptHash: voter.receiptHash || null,
      votedAt: voter.votedAt || null,
      updatedAt: new Date().toISOString(),
      createdAt: voter.registeredAt || new Date().toISOString(),
    };
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(uid: string): Promise<VoterProfile | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.userId || uid,
        studentId: data.studentId,
        name: data.name,
        departmentId: data.departmentId,
        year: data.year,
        email: data.email,
        collegeIdNumber: data.collegeIdNumber,
        isVerified: data.isVerified ?? true,
        hasVoted: data.hasVoted ?? false,
        receiptHash: data.receiptHash || undefined,
        votedAt: data.votedAt || undefined,
        registeredAt: data.createdAt,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Record Ballot in Firestore Voting Vault
export async function recordBallotToFirestore(ballot: VaultBallot): Promise<void> {
  const path = `ballots/${ballot.ballotId}`;
  try {
    const ballotRef = doc(db, 'ballots', ballot.ballotId);
    const payload = {
      ballotId: ballot.ballotId,
      voterId: ballot.voterId || auth.currentUser?.uid || 'ANONYMOUS_VOTER',
      voterRollHash: ballot.voterRollHash,
      departmentId: ballot.departmentId,
      timestamp: ballot.timestamp,
      receiptHash: ballot.receiptHash,
      signature: ballot.signature,
      status: ballot.status,
      blockNumber: ballot.blockNumber,
      selections: ballot.selections,
    };
    await setDoc(ballotRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Mark user voted in Firestore
export async function markUserVotedInFirestore(uid: string, receiptHash: string, votedAt: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      hasVoted: true,
      receiptHash,
      votedAt,
      updatedAt: votedAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
