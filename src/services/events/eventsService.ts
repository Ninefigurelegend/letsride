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
 * Get all events visible to user (public + friends + invited)
 * 
 * This function queries all events the user has permission to see:
 * - Public events (visible to all)
 * - Friends-only events from friends
 * - Invite-only events where user is invited
 * - Events user created or participates in
 */
export async function getAllEvents(userId: string): Promise<Event[]> {
  // Get user's friend IDs
  const friendsSnapshot = await getDocs(
    collection(firestore, `users/${userId}/friends`)
  );
  const friendIds = friendsSnapshot.docs.map((doc) => doc.id);

  // Query for events user can see:
  // 1. Public events
  const publicQuery = query(
    collection(firestore, EVENTS_COLLECTION),
    where('visibility', '==', 'public'),
    orderBy('startsAt', 'desc')
  );

  // 2. Friends-only events from friends
  const friendsEventsPromises =
    friendIds.length > 0
      ? friendIds.map((friendId) =>
          getDocs(
            query(
              collection(firestore, EVENTS_COLLECTION),
              where('createdBy', '==', friendId),
              where('visibility', '==', 'friends'),
              orderBy('startsAt', 'desc')
            )
          )
        )
      : [];

  // 3. Events user created (any visibility)
  const myEventsQuery = query(
    collection(firestore, EVENTS_COLLECTION),
    where('createdBy', '==', userId),
    orderBy('startsAt', 'desc')
  );

  // Note: Invited events are now available as a separate filter
  // See getInvitedEvents() function

  // Execute all queries in parallel
  const [publicSnapshot, myEventsSnapshot, ...friendsSnapshots] =
    await Promise.all([
      getDocs(publicQuery),
      getDocs(myEventsQuery),
      ...friendsEventsPromises,
    ]);

  // Combine results and remove duplicates using a Map
  const eventsMap = new Map<string, Event>();

  // Add public events
  publicSnapshot.docs.forEach((doc) => {
    eventsMap.set(doc.id, { id: doc.id, ...doc.data() } as Event);
  });

  // Add user's own events
  myEventsSnapshot.docs.forEach((doc) => {
    eventsMap.set(doc.id, { id: doc.id, ...doc.data() } as Event);
  });

  // Add friends' events
  friendsSnapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      eventsMap.set(doc.id, { id: doc.id, ...doc.data() } as Event);
    });
  });

  return Array.from(eventsMap.values()).sort((a, b) => {
    // Sort by startsAt descending
    const aTime = a.startsAt instanceof Timestamp ? a.startsAt.toMillis() : 0;
    const bTime = b.startsAt instanceof Timestamp ? b.startsAt.toMillis() : 0;
    return bTime - aTime;
  });
}

/**
 * Get events from friends only
 * 
 * This function fetches events created by user's friends:
 * - Public events from friends
 * - Friends-only events from friends
 * - Does not include invite-only events unless user is invited
 */
export async function getFriendsEvents(userId: string): Promise<Event[]> {
  // Get user's friend IDs
  const friendsSnapshot = await getDocs(
    collection(firestore, `users/${userId}/friends`)
  );
  const friendIds = friendsSnapshot.docs.map((doc) => doc.id);

  if (friendIds.length === 0) {
    return [];
  }

  // Query events from friends (public or friends-only visibility only)
  const friendsEventsPromises = friendIds.map((friendId) =>
    getDocs(
      query(
        collection(firestore, EVENTS_COLLECTION),
        where('createdBy', '==', friendId),
        where('visibility', 'in', ['public', 'friends']),
        orderBy('startsAt', 'desc')
      )
    )
  );

  const snapshots = await Promise.all(friendsEventsPromises);

  // Combine results (invite-only events already excluded by query)
  const eventsMap = new Map<string, Event>();
  
  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const event = { id: doc.id, ...doc.data() } as Event;
      eventsMap.set(doc.id, event);
    });
  });

  return Array.from(eventsMap.values()).sort((a, b) => {
    // Sort by startsAt descending
    const aTime = a.startsAt instanceof Timestamp ? a.startsAt.toMillis() : 0;
    const bTime = b.startsAt instanceof Timestamp ? b.startsAt.toMillis() : 0;
    return bTime - aTime;
  });
}

/**
 * Get events where user is invited
 */
export async function getInvitedEvents(userId: string): Promise<Event[]> {
  const q = query(
    collection(firestore, EVENTS_COLLECTION),
    where('visibility', '==', 'invite'),
    where('invited', 'array-contains', userId),
    orderBy('startsAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

