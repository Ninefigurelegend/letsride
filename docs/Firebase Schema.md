# RideApp – Full Firebase Schema
Platform: React Native (Expo) + Firebase  
Services used: Firestore, Authentication, Storage, Realtime Database, Cloud Messaging  

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
| `participants` | string[] | User IDs |
| `invited` | string[] | (For invite-only events) |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

# 3. CHATS

## Collection: `/chats/{chatId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `isGroup` | boolean | DM or group chat |
| `name` | string \| null | Group name |
| `participants` | string[] | List of userIds |
| `admins` | string[] | (optional, for groups) |
| `avatarUrl` | string \| null | Group avatar |
| `lastMessageText` | string | For chat preview |
| `lastMessageSender` | string | userId |
| `lastMessageAt` | timestamp | |
| `typing` | { [userId]: boolean } | Typing indicator |
| `createdAt` | timestamp | |

---

# 4. MESSAGES

## Subcollection: `/chats/{chatId}/messages/{messageId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `senderId` | string | userId |
| `text` | string \| null | Message text |
| `mediaUrl` | string \| null | Image/video URL |
| `mediaType` | 'image' \| 'video' \| null | |
| `timestamp` | timestamp | Message sent time |
| `reactions` | object | `{ userId: '❤️' }` |
| `replyTo` | string \| null | messageId it replies to |
| `deletedFor` | string[] | User IDs who deleted it |
| `status` | 'sent' \| 'delivered' \| 'read' | Read receipts |

---

# 5. CHAT READ RECEIPTS

## Subcollection: `/chats/{chatId}/readReceipts/{userId}`

### Fields
| Field | Type | Description |
|-------|------|--------------|
| `lastReadMessageId` | string | |
| `lastReadAt` | timestamp | |

---

# 6. NOTIFICATIONS (Optional Enhancement)

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

# 7. APP SETTINGS

## Collection: `/settings/appConfig`
| Field | Type | Description |
|-------|------|-------------|
| `latestVersion` | string | Force updates if needed |
| `maintenanceMode` | boolean | |

---

# 8. REALTIME DATABASE (Presence System)

Use this for online status (WhatsApp-style).

## Path: `/status/{userId}`

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `state` | 'online' \| 'offline' | |
| `lastChanged` | timestamp | |

---

# 9. FIREBASE STORAGE STRUCTURE

```
/media/
  /avatars/{userId}.jpg
  /events/{eventId}/{fileName}.jpg
  /chats/{chatId}/{messageId}/image.jpg
  /chats/{chatId}/{messageId}/video.mp4
```

---

# 10. FIRESTORE INDEXES REQUIRED

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
  participants ARRAY_CONTAINS
  lastMessageAt DESC
```

## Messages
```
messages:
  index: timestamp ASC
```

---

# 11. FIRESTORE SECURITY RULES (Skeleton)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // USERS
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // FRIENDS
    match /users/{userId}/friends/{friendId} {
      allow read, write: if request.auth.uid == userId;
    }

    // EVENTS
    match /events/{eventId} {
      allow read: if isEventVisible();
      allow write: if isEventOwner();
    }

    // CHATS
    match /chats/{chatId} {
      allow read, write: if isParticipant();
    }

    // MESSAGES
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if isParticipant();
    }
  }
}
```

---

# 12. STORAGE RULES (Skeleton)

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

# 13. PRESENCE RULES (Realtime DB)

```
{
  "rules": {
    "status": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

---

# END OF SCHEMA
