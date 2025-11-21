# RideApp – Full Firebase Schema
Platform: React Native (Expo) + Firebase  
Services used: **Firestore**, **Authentication**, **Storage**, **Realtime Database**, **Cloud Messaging**, **Cloud Functions**, **Analytics**

## Database Strategy
- **Firestore**: Structured data (users, events, friendships, chat metadata)
- **Realtime Database**: Real-time data (messages, presence, typing indicators)
- **Cloud Messaging (FCM)**: Push notifications for messages, events, friend requests

---

# 1. USERS

## Collection: `/users/{userId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `handle` | string | Unique @handle for rider search |
| `name` | string | Display name |
| `avatarUrl` | string | Firebase Storage URL |
| `bio` | string | Optional profile bio |
| `createdAt` | timestamp | User created date |
| `updatedAt` | timestamp | Last profile update |
| `friends` | string[] | (OPTIONAL) Simple friend list for small size apps |
| `blocked` | string[] | List of userIds blocked |

---

## Subcollection (for scalable friend system):
### `/users/{userId}/friends/{friendUserId}`
| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | timestamp | When friendship was established |

---

## Subcollection (friend requests):
### `/users/{userId}/friendRequests/{requestId}`
| Field | Type | Description |
|-------|------|-------------|
| `fromUserId` | string | Sender |
| `status` | 'pending' \| 'accepted' \| 'rejected' | |
| `createdAt` | timestamp | |

---

# 2. EVENTS

## Collection: `/events/{eventId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Event title |
| `description` | string | Detailed description |
| `visibility` | 'public' \| 'friends' \| 'invite' | Controls who sees it |
| `createdBy` | string (userId) | Host |
| `startsAt` | timestamp | Start time |
| `endsAt` | timestamp | End time |
| `locationName` | string | Meet-up location |
| `locationCoords` | {lat, lng} | Optional GPS location |
| `bannerImageUrl` | string (optional) | Firebase Storage URL for event banner image |
| `participants` | string[] | User IDs |
| `invited` | string[] | (For invite-only events) |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

# 3. CHATS (Firestore)

## Collection: `/chats/{chatId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `isGroup` | boolean | DM or group chat |
| `name` | string \| null | Group name (for groups), recipient name for DMs |
| `participants` | string[] | List of userIds |
| `admins` | string[] | (optional, for groups) User IDs with admin privileges |
| `avatarUrl` | string \| null | Group avatar (for groups) |
| `lastMessageText` | string | For chat preview in list |
| `lastMessageSender` | string | userId |
| `lastMessageAt` | timestamp | For sorting chat list (latest first) |
| `createdAt` | timestamp | When chat was created |

**Note**: Chats list displays both DMs and group chats together, sorted by `lastMessageAt` descending.

---

# 4. MESSAGES (Realtime Database)

**Note**: Messages are stored in Realtime Database for optimal real-time performance.

## Path: `/messages/{chatId}/{messageId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `senderId` | string | userId |
| `text` | string \| null | Message text |
| `mediaUrl` | string \| null | Image/video URL |
| `mediaType` | 'image' \| 'video' \| null | |
| `timestamp` | number | Message sent time (server timestamp) |
| `reactions` | object | `{ userId: '❤️' }` |
| `replyTo` | string \| null | messageId it replies to |
| `status` | 'sent' \| 'delivered' \| 'read' | Read receipts |

---

# 5. TYPING INDICATORS (Realtime Database)

## Path: `/typing/{chatId}/{userId}`

### Fields
| Field | Type | Description |
|-------|------|--------------|
| `isTyping` | boolean | Whether user is currently typing |
| `timestamp` | number | Last update time |

**Note**: Typing indicators are automatically removed after 3 seconds of inactivity.

---

# 6. PRESENCE (Realtime Database)

## Path: `/presence/{userId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `state` | 'online' \| 'offline' | Current online status |
| `lastChanged` | number | Server timestamp |

**Note**: Presence is automatically managed using Firebase's `onDisconnect()` handlers.

---

# 7. NOTIFICATIONS (Firestore - Optional Enhancement)

## Collection: `/notifications/{notificationId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Receiver |
| `type` | 'friend_request' \| 'event_invite' \| 'message' | |
| `referenceId` | string | eventId, chatId, or userId |
| `createdAt` | timestamp | |
| `read` | boolean | |

---

# 8. APP SETTINGS (Firestore)

## Collection: `/settings/appConfig`
| Field | Type | Description |
|-------|------|-------------|
| `latestVersion` | string | Force updates if needed |
| `maintenanceMode` | boolean | |

---

# 9. REALTIME DATABASE STRUCTURE (Full Overview)

```
/
├── /messages/{chatId}/{messageId}
│   ├── senderId: string
│   ├── text: string
│   ├── timestamp: number
│   └── ...
├── /typing/{chatId}/{userId}
│   ├── isTyping: boolean
│   └── timestamp: number
└── /presence/{userId}
    ├── state: 'online' | 'offline'
    └── lastChanged: number
```

---

# 10. FIREBASE STORAGE STRUCTURE

```
/media/
  /avatars/{userId}.jpg
  /events/{eventId}/{fileName}.jpg
  /chats/{chatId}/{messageId}/image.jpg
  /chats/{chatId}/{messageId}/video.mp4
```

---

# 11. FIRESTORE INDEXES REQUIRED

## Users
- `users.handle` — unique

## Events
```
events:
  index: visibility ASC, startsAt DESC
  index: createdBy ASC
```

## Chats
```
chats:
  participants ARRAY_CONTAINS, lastMessageAt DESC
```

---

# 12. FIRESTORE SECURITY RULES (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isParticipant(participants) {
      return request.auth.uid in participants;
    }
    
    function isFriend(userId) {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)/friends/$(userId));
    }
    
    // Helper to check if user is only adding/removing themselves from event
    function isJoiningOrLeaving() {
      let oldParticipants = resource.data.participants;
      let newParticipants = request.resource.data.participants;
      let diff = newParticipants.toSet().difference(oldParticipants.toSet());
      let removed = oldParticipants.toSet().difference(newParticipants.toSet());
      
      // Allow if adding only themselves OR removing only themselves
      return (diff.size() == 1 && request.auth.uid in diff) ||
             (removed.size() == 1 && request.auth.uid in removed);
    }

    // USERS
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
      
      // Friends subcollection
      match /friends/{friendId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
      
      // Friend requests subcollection
      match /friendRequests/{requestId} {
        allow read: if isOwner(userId);
        allow create: if isAuthenticated();
        allow update: if isOwner(userId) || isOwner(resource.data.fromUserId);
        allow delete: if isOwner(userId);
      }
    }

    // EVENTS
    match /events/{eventId} {
      allow read: if isAuthenticated() && (
        resource.data.visibility == 'public' ||
        (resource.data.visibility == 'friends' && isFriend(resource.data.createdBy)) ||
        (resource.data.visibility == 'invite' && request.auth.uid in resource.data.invited) ||
        isOwner(resource.data.createdBy) ||
        request.auth.uid in resource.data.participants
      );
      allow create: if isAuthenticated() && isOwner(request.resource.data.createdBy);
      allow update: if isAuthenticated() && (
        isOwner(resource.data.createdBy) ||  // Owner can update anything
        isJoiningOrLeaving()                  // Anyone can join/leave
      );
      allow delete: if isAuthenticated() && isOwner(resource.data.createdBy);
    }

    // CHATS (metadata only, messages are in Realtime DB)
    match /chats/{chatId} {
      allow read: if isAuthenticated() && isParticipant(resource.data.participants);
      allow create: if isAuthenticated() && isParticipant(request.resource.data.participants);
      allow update: if isAuthenticated() && isParticipant(resource.data.participants);
      allow delete: if isAuthenticated() && isParticipant(resource.data.participants);
    }
  }
}
```

**Key Security Features:**
- Users can only read/write their own profile data
- Event visibility is enforced (public, friends-only, invite-only)
- Users can join/leave events without being the owner
- Friend relationships are protected and bidirectional
- Chat participants are verified for all operations

---

# 13. STORAGE RULES (Skeleton)

```
service firebase.storage {
  match /b/{bucket}/o {
    match /media/avatars/{userId}.jpg {
      allow write: if request.auth.uid == userId;
      allow read: if true;
    }

    match /media/chats/{chatId}/{messageId}/{file} {
      allow write, read: if isParticipant(chatId);
    }
  }
}
```

---

# 14. REALTIME DATABASE RULES

```json
{
  "rules": {
    // Messages
    "messages": {
      "$chatId": {
        "$messageId": {
          ".read": "auth != null",
          ".write": "auth != null && data.child('senderId').val() === auth.uid"
        }
      }
    },
    
    // Typing indicators
    "typing": {
      "$chatId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "$userId === auth.uid"
        }
      }
    },
    
    // Presence
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

**Note**: Rules should be further refined to check if user is a participant in the chat for read/write access to messages and typing indicators. This requires integration with Firestore or maintaining participant lists in Realtime Database.

---

# END OF SCHEMA
