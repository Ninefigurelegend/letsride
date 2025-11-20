import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import { Event, EventVisibility } from '@/types/models';

const EVENTS_COLLECTION = 'events';

/**
 * Create a new event
 */
export async function createEvent(
  userId: string,
  data: {
    title: string;
    description: string;
    visibility: EventVisibility;
    startsAt: Date;
    endsAt: Date;
    locationName: string;
    locationCoords?: { lat: number; lng: number };
    invited?: string[];
  }
): Promise<string> {
  const eventRef = await addDoc(collection(firestore, EVENTS_COLLECTION), {
    ...data,
    createdBy: userId,
    participants: [userId],
    startsAt: Timestamp.fromDate(data.startsAt),
    endsAt: Timestamp.fromDate(data.endsAt),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return eventRef.id;
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  const eventRef = doc(firestore, EVENTS_COLLECTION, eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return null;
  }

  return {
    id: eventSnap.id,
    ...eventSnap.data(),
  } as Event;
}

/**
 * Get public events
 */
export async function getPublicEvents(): Promise<Event[]> {
  const q = query(
    collection(firestore, EVENTS_COLLECTION),
    where('visibility', '==', 'public'),
    orderBy('startsAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Get events created by user
 */
export async function getMyEvents(userId: string): Promise<Event[]> {
  const q = query(
    collection(firestore, EVENTS_COLLECTION),
    where('createdBy', '==', userId),
    orderBy('startsAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Get events where user is a participant
 */
export async function getMyParticipatingEvents(userId: string): Promise<Event[]> {
  const q = query(
    collection(firestore, EVENTS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('startsAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Join an event
 */
export async function joinEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(firestore, EVENTS_COLLECTION, eventId);

  await updateDoc(eventRef, {
    participants: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Leave an event
 */
export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(firestore, EVENTS_COLLECTION, eventId);

  await updateDoc(eventRef, {
    participants: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update event
 */
export async function updateEvent(
  eventId: string,
  data: Partial<Omit<Event, 'id' | 'createdBy' | 'createdAt'>>
): Promise<void> {
  const eventRef = doc(firestore, EVENTS_COLLECTION, eventId);

  // Convert Date objects to Timestamps if present
  const updateData: any = { ...data };
  if (data.startsAt && data.startsAt instanceof Date) {
    updateData.startsAt = Timestamp.fromDate(data.startsAt as any);
  }
  if (data.endsAt && data.endsAt instanceof Date) {
    updateData.endsAt = Timestamp.fromDate(data.endsAt as any);
  }

  await updateDoc(eventRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const eventRef = doc(firestore, EVENTS_COLLECTION, eventId);
  await deleteDoc(eventRef);
}

/**
 * Get all events (for filtering on client side)
 * 
 * PHASE 4 DEPENDENCY: This function works with development security rules,
 * but requires Phase 4 (Social Module) to work with production security rules.
 * 
 * Production rules check each event's visibility:
 * - public: accessible to all
 * - friends: requires friend relationship with creator
 * - invite: requires user to be in invited list
 * 
 * Until Phase 4 implements the friend system, this query will fail with
 * production security rules if any events have visibility='friends'.
 * 
 * WORKAROUND: Use development security rules during Phase 3 testing, or
 * use getPublicEvents() + getMyEvents() to fetch accessible events separately.
 */
export async function getAllEvents(): Promise<Event[]> {
  const q = query(
    collection(firestore, EVENTS_COLLECTION),
    orderBy('startsAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Get events from friends (PHASE 4 TODO)
 * 
 * This function will be implemented in Phase 4 (Social Module) and will:
 * 1. Fetch user's friend list from /users/{userId}/friends subcollection
 * 2. Query events where visibility='friends' AND createdBy is in friend list
 * 3. Combine with public events and events user participates in
 * 
 * @param userId - Current user's ID
 * @returns Promise<Event[]> - Events visible to user based on friend relationships
 */
export async function getFriendsEvents(userId: string): Promise<Event[]> {
  // PHASE 4 TODO: Implement this function
  // For now, return empty array
  console.warn('getFriendsEvents() is not yet implemented - requires Phase 4 (Social Module)');
  return [];
}

