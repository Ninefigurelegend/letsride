import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from './config';
import { User } from '@/types/models';

const USERS_COLLECTION = 'users';

/**
 * Create a new user document
 */
export async function createUser(
  userId: string,
  data: {
    handle: string;
    name: string;
    avatarUrl: string;
    bio?: string;
  }
): Promise<void> {
  const userRef = doc(firestore, USERS_COLLECTION, userId);
  
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    blocked: [],
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const userRef = doc(firestore, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  return {
    id: userSnap.id,
    ...userSnap.data(),
  } as User;
}

/**
 * Get user by handle
 */
export async function getUserByHandle(handle: string): Promise<User | null> {
  const q = query(
    collection(firestore, USERS_COLLECTION),
    where('handle', '==', handle)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return {
    id: userDoc.id,
    ...userDoc.data(),
  } as User;
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  data: Partial<Pick<User, 'name' | 'bio' | 'avatarUrl'>>
): Promise<void> {
  const userRef = doc(firestore, USERS_COLLECTION, userId);
  
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check if handle is available
 */
export async function isHandleAvailable(handle: string): Promise<boolean> {
  const user = await getUserByHandle(handle);
  return user === null;
}

