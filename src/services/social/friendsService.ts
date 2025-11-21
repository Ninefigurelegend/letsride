import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import { User, FriendRequest } from '@/types/models';
import { getUserById, getUserByHandle } from '@/services/firebase/firestore';

/**
 * Send friend request
 */
export async function sendFriendRequest(
  fromUserId: string,
  toHandle: string
): Promise<void> {
  // Find user by handle
  const toUser = await getUserByHandle(toHandle);

  if (!toUser) {
    throw new Error('User not found');
  }

  if (toUser.id === fromUserId) {
    throw new Error('Cannot send friend request to yourself');
  }

  // Check if already friends
  const existingFriendship = await getDocs(
    collection(firestore, `users/${fromUserId}/friends`)
  );
  const isFriend = existingFriendship.docs.some((doc) => doc.id === toUser.id);

  if (isFriend) {
    throw new Error('Already friends with this user');
  }

  // Check if request already sent
  const existingRequests = await getDocs(
    collection(firestore, `users/${toUser.id}/friendRequests`)
  );
  const hasPendingRequest = existingRequests.docs.some(
    (doc) =>
      doc.data().fromUserId === fromUserId && doc.data().status === 'pending'
  );

  if (hasPendingRequest) {
    throw new Error('Friend request already sent');
  }

  // Create friend request
  const requestRef = doc(
    collection(firestore, `users/${toUser.id}/friendRequests`)
  );

  await setDoc(requestRef, {
    fromUserId,
    toUserId: toUser.id,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(
  userId: string,
  requestId: string,
  fromUserId: string
): Promise<void> {
  // Add to both users' friends subcollections (bidirectional)
  await Promise.all([
    setDoc(doc(firestore, `users/${userId}/friends/${fromUserId}`), {
      createdAt: serverTimestamp(),
    }),
    setDoc(doc(firestore, `users/${fromUserId}/friends/${userId}`), {
      createdAt: serverTimestamp(),
    }),
  ]);

  // Delete friend request
  await deleteDoc(doc(firestore, `users/${userId}/friendRequests/${requestId}`));
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(
  userId: string,
  requestId: string
): Promise<void> {
  await deleteDoc(doc(firestore, `users/${userId}/friendRequests/${requestId}`));
}

/**
 * Remove friend (unfriend)
 */
export async function removeFriend(
  userId: string,
  friendId: string
): Promise<void> {
  // Remove from both users' friends subcollections (bidirectional)
  await Promise.all([
    deleteDoc(doc(firestore, `users/${userId}/friends/${friendId}`)),
    deleteDoc(doc(firestore, `users/${friendId}/friends/${userId}`)),
  ]);
}

/**
 * Get user's friends
 */
export async function getFriends(userId: string): Promise<User[]> {
  const friendsSnapshot = await getDocs(
    collection(firestore, `users/${userId}/friends`)
  );

  const friendIds = friendsSnapshot.docs.map((doc) => doc.id);

  if (friendIds.length === 0) {
    return [];
  }

  // Fetch friend user data
  const friendsData = await Promise.all(
    friendIds.map((friendId) => getUserById(friendId))
  );

  return friendsData.filter((friend): friend is User => friend !== null);
}

/**
 * Get pending friend requests (received)
 */
export async function getPendingFriendRequests(
  userId: string
): Promise<FriendRequest[]> {
  const requestsSnapshot = await getDocs(
    query(
      collection(firestore, `users/${userId}/friendRequests`),
      where('status', '==', 'pending')
    )
  );

  return requestsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FriendRequest[];
}

/**
 * Check if users are friends
 */
export async function areFriends(
  userId: string,
  otherUserId: string
): Promise<boolean> {
  const friendsSnapshot = await getDocs(
    collection(firestore, `users/${userId}/friends`)
  );

  return friendsSnapshot.docs.some((doc) => doc.id === otherUserId);
}

