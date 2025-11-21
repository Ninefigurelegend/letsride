# Phase 4 Dependencies - Social Module Required Features

**Created**: November 20, 2025  
**Status**: Pending Phase 4 Implementation

---

## Overview

Several features in the Events Module (Phase 3) are currently stubbed out and require the Social Module (Phase 4) to be fully functional. This document tracks those dependencies and provides a roadmap for enabling them.

---

## 🚧 **Blocked Features**

### 1. **"All Events" Filter** 
**Location**: `EventsFeedScreen.tsx` (line ~95)  
**Status**: ⏳ Stubbed - Shows "Coming in Phase 4" message

**Problem**:
- Calls `getAllEvents()` which queries all events without filtering
- Production security rules evaluate each event's visibility
- Rules fail when checking `isFriend()` for events with `visibility='friends'`
- No friend relationships exist yet, so query returns "Missing permissions" error

**What's Needed (Phase 4)**:
1. Implement friend relationships in Firestore:
   - `/users/{userId}/friends/{friendId}` subcollection
   - Friend request system
   - Accept/reject friend requests
2. Update `getAllEvents()` to work with production rules
3. OR: Implement smart filtering that combines multiple queries:
   ```typescript
   const publicEvents = await getPublicEvents();
   const myEvents = await getMyEvents(userId);
   const friendEvents = await getFriendsEvents(userId); // Phase 4
   const invitedEvents = await getInvitedEvents(userId); // Phase 4
   // Merge and dedupe
   ```

**Files Affected**:
- `src/screens/events/EventsFeedScreen.tsx` (lines 63-122)
- `src/services/events/eventsService.ts` (lines 178-212)

---

### 2. **"Friends" Filter**
**Location**: `EventsFeedScreen.tsx` (line ~88)  
**Status**: ⏳ Stubbed - Shows "Coming in Phase 4" message

**Problem**:
- Currently just returns empty array
- No friend relationships to query against
- `getFriendsEvents()` function is stubbed out

**What's Needed (Phase 4)**:
1. Implement `getFriendsEvents()` in `eventsService.ts`:
   ```typescript
   export async function getFriendsEvents(userId: string): Promise<Event[]> {
     // 1. Get user's friend list
     const friendsSnapshot = await getDocs(
       collection(firestore, `users/${userId}/friends`)
     );
     const friendIds = friendsSnapshot.docs.map(doc => doc.id);
     
     // 2. Query events where:
     //    - visibility='friends' AND createdBy IN friendIds
     //    - OR visibility='public'
     //    - OR user is participant
     
     // 3. Return combined results
   }
   ```
2. Update EventsFeedScreen to call `getFriendsEvents()` for 'friends' filter
3. Test with real friend relationships

**Files Affected**:
- `src/screens/events/EventsFeedScreen.tsx` (lines 88-95)
- `src/services/events/eventsService.ts` (lines 213-225)

---

## 📋 **Security Rules Context**

### Current Production Rules (Deployed)
```javascript
match /events/{eventId} {
  allow read: if isAuthenticated() && (
    resource.data.visibility == 'public' ||
    (resource.data.visibility == 'friends' && isFriend(resource.data.createdBy)) ||  // ← BLOCKS "All"
    (resource.data.visibility == 'invite' && request.auth.uid in resource.data.invited) ||
    isOwner(resource.data.createdBy) ||
    request.auth.uid in resource.data.participants
  );
}

function isFriend(userId) {
  return exists(/databases/$(database)/documents/users/$(request.auth.uid)/friends/$(userId));
}
```

**Why This Blocks "All" Filter**:
- `getAllEvents()` tries to fetch ALL events
- Some events have `visibility='friends'`
- Rules check `isFriend(createdBy)` for those events
- `/users/{currentUserId}/friends/{creatorId}` doesn't exist → `exists()` returns false
- Rule fails → Permission denied

### Development Rules (Workaround)
```javascript
match /events/{eventId} {
  allow read: if isAuthenticated();  // ← Allows all reads
}
```

**Use During**: Phase 3 testing only  
**Deploy Production Rules**: After Phase 4 completion

---

## 🎯 **Implementation Checklist (Phase 4)**

### Friend System Foundation
- [ ] Create `friendsService.ts` with:
  - [ ] `sendFriendRequest(fromUserId, toHandle)`
  - [ ] `acceptFriendRequest(userId, requestId, fromUserId)`
  - [ ] `rejectFriendRequest(userId, requestId)`
  - [ ] `getFriends(userId)`
  - [ ] `removeFriend(userId, friendId)`
- [ ] Create `friendsStore.ts` for state management
- [ ] Implement friend request UI screens

### Events Module Updates
- [ ] Implement `getFriendsEvents()` in `eventsService.ts`
- [ ] Implement `getInvitedEvents()` for invite-only events
- [ ] Update EventsFeedScreen:
  - [ ] Remove stub for 'friends' filter
  - [ ] Call `getFriendsEvents()` instead of returning empty array
  - [ ] Remove stub for 'all' filter
  - [ ] Implement smart query combining:
    - Public events
    - User's own events
    - Friend events (where user is friends with creator)
    - Invited events (where user is in invited list)
    - Participating events (where user is in participants)
- [ ] Update empty state messages
- [ ] Remove "Coming in Phase 4" placeholder

### Testing
- [ ] Create test friend relationships
- [ ] Create events with different visibility levels
- [ ] Test "All" filter shows correct events
- [ ] Test "Friends" filter shows only friend events
- [ ] Verify security rules allow proper access
- [ ] Test edge cases (unfriending, blocking)

---

## 📝 **Code References**

### Stubbed Functions
```typescript
// src/services/events/eventsService.ts (lines 213-225)
export async function getFriendsEvents(userId: string): Promise<Event[]> {
  // PHASE 4 TODO: Implement this function
  console.warn('getFriendsEvents() not yet implemented - requires Phase 4');
  return [];
}
```

### Stubbed Filter Cases
```typescript
// src/screens/events/EventsFeedScreen.tsx (lines 88-102)
case 'friends':
  // PHASE 4 TODO: Implement friends-only events filter
  console.log('Friends filter - will be available in Phase 4');
  fetchedEvents = [];
  break;

case 'all':
  // PHASE 4 TODO: Implement all events filter with proper permissions
  console.log('All filter - will be available in Phase 4');
  fetchedEvents = [];
  break;
```

### Empty State Message
```typescript
// src/screens/events/EventsFeedScreen.tsx (lines 310-328)
if (filter === 'all' || filter === 'friends') {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="construct-outline" size={80} color={colors.gray300} />
      <Text style={styles.emptyTitle}>Coming in Phase 4</Text>
      <Text style={styles.emptyText}>
        {filter === 'all'
          ? 'The "All Events" filter will be available once the Social Module (Phase 4) is implemented.'
          : 'The "Friends" filter will be available once the Social Module (Phase 4) is implemented.'}
      </Text>
    </View>
  );
}
```

---

## 🔄 **Workaround for Phase 3 Testing**

If you need to test all filters during Phase 3:

1. **Deploy Development Security Rules** (see above)
2. **Create test events** with different visibility levels
3. **Test filters** - all should work
4. **Deploy Production Rules** before Phase 10 (Production Deployment)

**Remember**: Don't deploy with development rules in production!

---

## 📊 **Timeline**

| Phase | Feature | Status | ETA |
|-------|---------|--------|-----|
| Phase 3 | Events Module | ✅ Complete (with stubs) | Done |
| Phase 4 | Social Module | ⏳ Required for full functionality | Next |
| Phase 4 | Friend Relationships | ⏳ Blocker for "All" and "Friends" filters | Next |
| Phase 5+ | Full Events Module | ⏳ All filters working | After Phase 4 |

---

**End of Phase 4 Dependencies Document**

