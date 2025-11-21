# LetsRide Implementation Plan

> **Last Updated**: November 20, 2025  
> **Status**: Phase 1 Complete ✅ | Phase 2 Complete ✅ | Phase 3 Complete ✅ | Ready for Phase 4 (Social Module) 

## Table of Contents

1. [Overview](#overview)
2. [Development Phases](#development-phases)
3. [Phase 0: Project Foundation](#phase-0-project-foundation)
4. [Phase 1: Authentication & User Management](#phase-1-authentication--user-management)
5. [Phase 2: Core Navigation & UI Structure](#phase-2-core-navigation--ui-structure)
6. [Phase 3: Events Module](#phase-3-events-module)
7. [Phase 4: Social Module](#phase-4-social-module)
8. [Phase 5: Messaging Module](#phase-5-messaging-module)
9. [Phase 6: Profile & Settings](#phase-6-profile--settings)
10. [Phase 7: Push Notifications](#phase-7-push-notifications)
11. [Phase 8: Testing & Quality Assurance](#phase-8-testing--quality-assurance)
12. [Phase 9: Performance Optimization](#phase-9-performance-optimization)
13. [Phase 10: Production Deployment](#phase-10-production-deployment)
14. [Best Practices & Guidelines](#best-practices--guidelines)
15. [Appendix](#appendix)

---

## Overview

This implementation plan provides a step-by-step guide for building LetsRide, a social event mobile application for motorcyclists. The plan is organized into phases, with each phase building upon the previous one. Each phase includes specific tasks, code examples, testing requirements, and success criteria.

### Key Principles

1. **Incremental Development**: Build and test features incrementally
2. **Type Safety**: Leverage TypeScript throughout the application
3. **State Management**: Use Zustand for predictable state management
4. **Real-time First**: Implement real-time features using Firebase Realtime Database
5. **User Experience**: Prioritize smooth, native-feeling interactions
6. **Security**: Implement Firebase Security Rules from day one
7. **Scalability**: Design data models and architecture for growth

### Technology Stack Summary

- **Frontend**: React Native (Expo SDK 54+), TypeScript, StyleSheets
- **State Management**: Zustand with slice pattern
- **Navigation**: React Navigation 6.x (Stack, Bottom Tabs, Material Top Tabs)
- **Backend**: Firebase (Auth, Firestore, Realtime Database, Storage, FCM, Functions, Analytics)
- **Development Tools**: EAS Build, Expo Dev Client

---

## Development Phases

### Phase Overview

| Phase | Name | Duration | Dependencies | Priority | Status |
|-------|------|----------|--------------|----------|--------|
| 0 | Project Foundation | 1-2 days | None | Critical | ✅ Complete |
| 1 | Authentication & User Management | 3-5 days | Phase 0 | Critical | ✅ Complete |
| 2 | Core Navigation & UI Structure | 2-3 days | Phase 1 | Critical | ✅ Complete |
| 3 | Events Module | 5-7 days | Phase 2 | High | ✅ Complete |
| 4 | Social Module | 4-6 days | Phase 2 | High | Pending |
| 5 | Messaging Module | 7-10 days | Phase 2, 4 | High | Pending |
| 6 | Profile & Settings | 2-3 days | Phase 1 | Medium | Pending |
| 7 | Push Notifications | 3-4 days | Phase 5 | Medium | Pending |
| 8 | Testing & QA | Ongoing | All | High | Pending |
| 9 | Performance Optimization | 2-3 days | Phase 8 | Medium | Pending |
| 10 | Production Deployment | 2-3 days | Phase 9 | Critical | Pending |

**Total Estimated Duration**: 6-8 weeks for MVP

---

## Phase 0: Project Foundation

**Goal**: Establish project structure, Firebase configuration, and development environment.

### Tasks

#### 0.1 Project Structure Setup

Create the following directory structure:

```
/src
├── /components
│   ├── /common           # Reusable UI components
│   ├── /events           # Event-specific components
│   ├── /social           # Social/friend components
│   └── /messaging        # Chat components
├── /screens
│   ├── /auth             # Authentication screens
│   ├── /events           # Events tab screens
│   ├── /people           # People tab screens
│   ├── /chats            # Chats tab screens
│   └── /profile          # Profile/Me tab screens
├── /navigation
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainTabNavigator.tsx
├── /stores               # Zustand state stores
│   ├── authStore.ts
│   ├── userStore.ts
│   ├── eventsStore.ts
│   ├── chatsStore.ts
│   └── friendsStore.ts
├── /services
│   ├── /firebase
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   ├── realtime.ts
│   │   └── storage.ts
│   ├── /events
│   ├── /messaging
│   └── /social
├── /hooks                # Custom React hooks
├── /utils                # Helper functions
├── /types                # TypeScript type definitions
│   ├── navigation.ts
│   ├── models.ts
│   └── firebase.ts
├── /constants
│   ├── config.ts
│   └── theme.ts
└── /theme
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

**Implementation Steps**:

1. Create all directories in `/src`
2. Add basic `index.ts` barrel exports where appropriate
3. Create `.gitkeep` files for empty directories

#### 0.2 Firebase Configuration

**File**: `/src/services/firebase/config.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { env } from 'expo-env';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  databaseURL: env.FIREBASE_DATABASE_URL,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);

// Analytics (web only)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
```

**Environment Variables**: Create `.env` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Sign-In
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id

# Expo Project ID (for push notifications)
PROJECT_ID=your_expo_project_id
```

**Note**: All environment variables are accessed via `expo-env` using `env.VARIABLE_NAME`

#### 0.3 TypeScript Type Definitions

**File**: `/src/types/models.ts`

```typescript
import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  blocked?: string[];
}

// Event Types
export type EventVisibility = 'public' | 'friends' | 'invite';

export interface Event {
  id: string;
  title: string;
  description: string;
  visibility: EventVisibility;
  createdBy: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  locationName: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
  participants: string[];
  invited?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Chat Types
export interface Chat {
  id: string;
  isGroup: boolean;
  name: string | null;
  participants: string[];
  admins?: string[];
  avatarUrl?: string | null;
  lastMessageText: string;
  lastMessageSender: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MediaType = 'image' | 'video' | null;

export interface Message {
  id: string;
  senderId: string;
  text: string | null;
  mediaUrl?: string | null;
  mediaType?: MediaType;
  timestamp: number;
  reactions?: { [userId: string]: string };
  replyTo?: string | null;
  status: MessageStatus;
}

// Friendship Types
export interface Friendship {
  userId: string;
  friendUserId: string;
  createdAt: Timestamp;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

// Presence Types
export interface Presence {
  state: 'online' | 'offline';
  lastChanged: number;
}

export interface TypingIndicator {
  isTyping: boolean;
  timestamp: number;
}
```

**File**: `/src/types/navigation.ts`

```typescript
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Navigator
export type AuthStackParamList = {
  Welcome: undefined;
  ProfileSetup: { 
    firebaseUserId: string;
    displayName: string;
    photoURL: string;
  };
};

// Events Stack
export type EventsStackParamList = {
  EventsFeed: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
};

// People Stack
export type PeopleStackParamList = {
  PeopleList: undefined;
  AddFriend: undefined;
  UserProfile: { userId: string };
};

// Chats Stack
export type ChatsStackParamList = {
  ChatList: undefined;
  NewChat: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  About: undefined;
  ComponentLibrary: undefined; // Dev/Testing screen
};

// Main Tab Navigator
export type MainTabParamList = {
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  PeopleTab: NavigatorScreenParams<PeopleStackParamList>;
  ChatsTab: NavigatorScreenParams<ChatsStackParamList>;
  MeTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Chatroom: { chatId: string; chatName: string };
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type EventsScreenProps<T extends keyof EventsStackParamList> =
  NativeStackScreenProps<EventsStackParamList, T>;

export type PeopleScreenProps<T extends keyof PeopleStackParamList> =
  NativeStackScreenProps<PeopleStackParamList, T>;

export type ChatsScreenProps<T extends keyof ChatsStackParamList> =
  NativeStackScreenProps<ChatsStackParamList, T>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
```

#### 0.4 Theme Configuration

**File**: `/src/theme/colors.ts`

```typescript
export const colors = {
  // Primary palette
  primary: '#FF6B35',      // Vibrant orange for motorcycling theme
  primaryDark: '#E55A2B',
  primaryLight: '#FF8557',
  
  // Secondary palette
  secondary: '#2D3748',    // Dark gray
  secondaryDark: '#1A202C',
  secondaryLight: '#4A5568',
  
  // Accent
  accent: '#38B2AC',       // Teal for accents
  accentDark: '#2C7A7B',
  accentLight: '#4FD1C5',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F7FAFC',
  gray100: '#EDF2F7',
  gray200: '#E2E8F0',
  gray300: '#CBD5E0',
  gray400: '#A0AEC0',
  gray500: '#718096',
  gray600: '#4A5568',
  gray700: '#2D3748',
  gray800: '#1A202C',
  gray900: '#171923',
  
  // Semantic colors
  success: '#48BB78',
  warning: '#ECC94B',
  error: '#F56565',
  info: '#4299E1',
  
  // Background
  background: '#F7FAFC',
  surface: '#FFFFFF',
  
  // Text
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#A0AEC0',
  textInverse: '#FFFFFF',
  
  // Chat colors
  sentMessage: '#FF6B35',
  receivedMessage: '#EDF2F7',
  onlineStatus: '#48BB78',
  offlineStatus: '#A0AEC0',
  
  // Borders
  border: '#E2E8F0',
  borderDark: '#CBD5E0',
};
```

**File**: `/src/theme/typography.ts`

```typescript
export const typography = {
  // Font families (use system fonts for React Native)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

**File**: `/src/theme/spacing.ts`

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

#### 0.5 Firebase Security Rules

**Firestore Security Rules**: Deploy to Firebase Console

```javascript
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
    
    // Users collection
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
    
    // Events collection
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
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if isAuthenticated() && isParticipant(resource.data.participants);
      allow create: if isAuthenticated() && isParticipant(request.resource.data.participants);
      allow update: if isAuthenticated() && isParticipant(resource.data.participants);
      allow delete: if isAuthenticated() && isParticipant(resource.data.participants);
    }
  }
}
```

**Realtime Database Security Rules**: Deploy to Firebase Console

```json
{
  "rules": {
    "messages": {
      "$chatId": {
        ".read": "auth != null",
        "$messageId": {
          ".write": "auth != null && (!data.exists() || data.child('senderId').val() === auth.uid)",
          ".validate": "newData.hasChildren(['senderId', 'timestamp', 'status'])"
        }
      }
    },
    "typing": {
      "$chatId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "$userId === auth.uid"
        }
      }
    },
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

**Storage Security Rules**: Deploy to Firebase Console

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidVideo() {
      return request.resource.contentType.matches('video/.*');
    }
    
    function isValidMedia() {
      return isValidImage() || isValidVideo();
    }
    
    function isUnder10MB() {
      return request.resource.size < 10 * 1024 * 1024;
    }
    
    function isUnder100MB() {
      return request.resource.size < 100 * 1024 * 1024;
    }
    
    // Profile avatars
    match /media/avatars/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isValidImage() && isUnder10MB();
    }
    
    // Event images
    match /media/events/{eventId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidImage() && isUnder10MB();
    }
    
    // Chat media
    match /media/chats/{chatId}/{messageId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidMedia() && isUnder100MB();
    }
  }
}
```

### Success Criteria

- [x] All directories and files created
- [x] Firebase configuration working with environment variables
- [x] TypeScript types defined without errors
- [x] Theme constants accessible throughout app
- [x] Security rules deployed to Firebase Console
- [x] Project compiles without errors

### ✅ Phase 0 Completed

**Completion Date**: November 20, 2025

**Deliverables**:
- ✅ Complete project directory structure (`/src` with all subdirectories)
- ✅ Firebase configuration with expo-env integration
- ✅ TypeScript type definitions (models, navigation)
- ✅ Theme system (colors, typography, spacing)
- ✅ Utility functions and constants
- ✅ Firebase Security Rules (Firestore, Realtime DB, Storage)
- ✅ Path aliases configured (`@/` imports)
- ✅ Additional packages installed (notifications, forms, utilities)

**Files Created**: 11 TypeScript files, 1 configuration file, 1 documentation file

**Next Steps**: Begin Phase 1 - Authentication & User Management

---

## Phase 1: Authentication & User Management

**Goal**: Implement Google Sign-In authentication and user profile management.

### Tasks

#### 1.1 Authentication Service

**File**: `/src/services/firebase/auth.ts`

```typescript
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { env } from 'expo-env';
import { auth } from './config';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: env.GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    // Check if device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get user info from Google
    const userInfo = await GoogleSignin.signIn();
    
    // Get Google credential
    const googleCredential = GoogleAuthProvider.credential(userInfo.data?.idToken);
    
    // Sign in with Firebase
    const userCredential = await signInWithCredential(auth, googleCredential);
    
    return userCredential.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
```

#### 1.2 Firestore User Service

**File**: `/src/services/firebase/firestore.ts`

```typescript
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
  Timestamp,
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
```

#### 1.3 Auth Store (Zustand)

**File**: `/src/stores/authStore.ts`

Enhanced with `isProfileLoading` to handle separate loading states for Firebase Auth and Firestore profile.

```typescript
import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  // State
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean; // NEW: Separate loading state for Firestore profile
  error: string | null;
  
  // Actions
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setProfileLoading: (isProfileLoading: boolean) => void; // NEW
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isProfileLoading: false,
  error: null,
  
  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      error: null,
    }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setProfileLoading: (isProfileLoading) => set({ isProfileLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearError: () => set({ error: null }),
  
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isProfileLoading: false,
      error: null,
    }),
}));
```

**Why `isProfileLoading`?**

This separate loading state prevents UI flickering during the profile fetch:
- `isLoading`: True while checking Firebase Auth state (very fast)
- `isProfileLoading`: True while fetching Firestore profile (can be slower)
- Users see loading screen until BOTH are complete
- Prevents flash of auth screen when profile is being loaded

#### 1.4 User Store (Zustand)

**File**: `/src/stores/userStore.ts`

```typescript
import { create } from 'zustand';
import { User } from '@/types/models';

interface UserState {
  // State
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  updateCurrentUser: (data: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // Initial state
  currentUser: null,
  isLoading: false,
  error: null,
  
  // Actions
  setCurrentUser: (currentUser) =>
    set({ currentUser, isLoading: false, error: null }),
  
  updateCurrentUser: (data) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, ...data }
        : null,
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearError: () => set({ error: null }),
  
  reset: () => set({ currentUser: null, isLoading: false, error: null }),
}));
```

#### 1.5 Authentication Screens

**File**: `/src/screens/auth/WelcomeScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AuthScreenProps } from '@/types/navigation';
import { signInWithGoogle } from '@/services/firebase/auth';
import { getUserById } from '@/services/firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { colors, typography, spacing } from '@/theme';

export default function WelcomeScreen({
  navigation,
}: AuthScreenProps<'Welcome'>) {
  const [isLoading, setIsLoading] = useState(false);
  const setAuthUser = useAuthStore((state) => state.setUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Sign in with Google
      const firebaseUser = await signInWithGoogle();
      
      // Check if user exists in Firestore
      const existingUser = await getUserById(firebaseUser.uid);
      
      if (existingUser) {
        // Existing user - set user data and proceed to app
        setAuthUser(firebaseUser);
        setCurrentUser(existingUser);
      } else {
        // New user - navigate to profile setup
        navigation.navigate('ProfileSetup', {
          firebaseUserId: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Rider',
          photoURL: firebaseUser.photoURL || '',
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Title */}
        <Text style={styles.title}>LetsRide</Text>
        <Text style={styles.subtitle}>
          Connect with riders. Join events. Ride together.
        </Text>
      </View>
      
      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Continue with Google</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.xs,
  },
});
```

**File**: `/src/screens/auth/ProfileSetupScreen.tsx`

This comprehensive onboarding screen allows new users to complete their profile before accessing the app.

**Key Features**:
- **Handle Selection**: Users choose a unique @handle (3-15 characters, alphanumeric + underscores)
- **Real-time Validation**: Immediate feedback on handle availability and format
- **Smart Suggestions**: Auto-generated handle suggestions based on Google display name
- **Display Name**: Customizable name (defaults to Google profile name)
- **Profile Photo**: Upload from gallery or use Google profile photo
- **Visual Feedback**: Loading states, checkmarks, error messages, and suggestions

**Implementation Highlights**:
```typescript
// Validation utilities for handle format and availability
import { validateHandleFormat, sanitizeHandle, generateHandleSuggestions } from '@/utils/validation';

// Profile photo upload to Firebase Storage
import { uploadProfilePhoto } from '@/services/firebase/storage';

// Real-time handle availability checking
const checkHandleAvailability = async (handleToCheck: string) => {
  const validation = validateHandleFormat(handleToCheck);
  if (!validation.isValid) {
    setError(validation.error || 'Invalid handle');
    return false;
  }

  const available = await isHandleAvailable(handleToCheck);
  if (!available) {
    setError('This handle is already taken');
    return false;
  }
  
  setError('');
  return true;
};

// Create user profile after validation
await createUser(firebaseUserId, {
  handle,
  name: name.trim(),
  avatarUrl: finalAvatarUrl,
  bio: '',
});
```

**User Flow**:
1. User signs in with Google on WelcomeScreen
2. If new user (no Firestore profile), navigate to ProfileSetupScreen
3. User sees Google photo and name pre-filled
4. User can tap photo to upload new image from gallery
5. User enters unique handle with real-time validation
6. Suggestions appear if user hasn't typed yet
7. Checkmark appears when handle is valid and available
8. User taps Continue to create Firestore profile
9. Profile photo uploads to Firebase Storage (if changed)
10. User document created in Firestore
11. User automatically proceeds to main app

#### 1.6 Handle Validation Utilities

**File**: `/src/utils/validation.ts`

```typescript
/**
 * Validate handle format
 * Rules:
 * - Must be 3-15 characters
 * - Lowercase alphanumeric and underscores only
 * - Must start with a letter
 * - Cannot end with underscore
 * - No consecutive underscores
 */
export function validateHandleFormat(handle: string): {
  isValid: boolean;
  error?: string;
} {
  if (!handle || handle.length === 0) {
    return { isValid: false, error: 'Handle is required' };
  }

  if (handle.length < 3) {
    return { isValid: false, error: 'Handle must be at least 3 characters' };
  }

  if (handle.length > 15) {
    return { isValid: false, error: 'Handle must be 15 characters or less' };
  }

  if (!/^[a-z]/.test(handle)) {
    return { isValid: false, error: 'Handle must start with a letter' };
  }

  if (!/^[a-z][a-z0-9_]*$/.test(handle)) {
    return {
      isValid: false,
      error: 'Handle can only contain lowercase letters, numbers, and underscores',
    };
  }

  if (handle.endsWith('_')) {
    return { isValid: false, error: 'Handle cannot end with an underscore' };
  }

  if (/__/.test(handle)) {
    return { isValid: false, error: 'Handle cannot have consecutive underscores' };
  }

  return { isValid: true };
}

/**
 * Sanitize handle input by removing invalid characters
 */
export function sanitizeHandle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
    .replace(/__+/g, '_') // Replace multiple underscores with single
    .substring(0, 15); // Enforce max length
}

/**
 * Generate handle suggestions from a name
 */
export function generateHandleSuggestions(name: string): string[] {
  const base = name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);

  if (!base || !/^[a-z]/.test(base)) {
    return ['rider123', 'biker456', 'moto789'];
  }

  const suggestions: string[] = [base];

  // Add variations with numbers
  suggestions.push(`${base}${Math.floor(Math.random() * 100)}`);
  suggestions.push(`${base}${Math.floor(Math.random() * 1000)}`);

  // Add variations with common suffixes
  if (base.length <= 11) {
    suggestions.push(`${base}_moto`);
    suggestions.push(`${base}_ride`);
  }

  return suggestions.slice(0, 5);
}
```

#### 1.7 Firebase Storage Service

**File**: `/src/services/firebase/storage.ts`

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload profile photo to Firebase Storage
 */
export async function uploadProfilePhoto(
  uri: string,
  userId: string
): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, `media/avatars/${userId}/${filename}`);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

/**
 * Upload event image to Firebase Storage
 */
export async function uploadEventImage(
  uri: string,
  eventId: string
): Promise<string> {
  // Implementation for Phase 3
}

/**
 * Upload chat media to Firebase Storage
 */
export async function uploadChatMedia(
  uri: string,
  chatId: string,
  messageId: string,
  type: 'image' | 'video'
): Promise<string> {
  // Implementation for Phase 5
}
```

#### 1.8 Reusable Input Component

**File**: `/src/components/common/Input.tsx`

A fully-featured, reusable text input component with support for labels, errors, helper text, and left/right elements.

```typescript
import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  leftElement?: React.ReactNode;  // For @ symbol, icons, etc.
  rightElement?: React.ReactNode; // For checkmarks, loading indicators, etc.
}

export default function Input({
  label,
  error,
  helperText,
  containerStyle,
  leftElement,
  rightElement,
  ...textInputProps
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        
        <TextInput
          style={[styles.input, leftElement ? styles.inputWithLeft : null]}
          placeholderTextColor={colors.gray400}
          {...textInputProps}
        />
        
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}
```

**Usage in ProfileSetupScreen**:
```typescript
<Input
  label="Handle"
  value={handle}
  onChangeText={handleChangeText}
  onBlur={handleBlur}
  placeholder="e.g., johnrider"
  autoCapitalize="none"
  leftElement={<Text style={styles.atSymbol}>@</Text>}
  rightElement={
    isChecking ? (
      <ActivityIndicator size="small" color={colors.primary} />
    ) : isHandleValid ? (
      <Text style={styles.checkmark}>✓</Text>
    ) : null
  }
  error={error}
  helperText="3-15 characters: lowercase letters, numbers, and underscores"
/>
```

#### 1.9 Auth Initialization Hook

**File**: `/src/hooks/useAuthInit.ts`

Enhanced with separate profile loading state to prevent UI flickering.

```typescript
import { useEffect } from 'react';
import { onAuthStateChange } from '@/services/firebase/auth';
import { getUserById } from '@/services/firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

/**
 * Initialize authentication state listener
 * Handles both Firebase Auth and Firestore profile loading
 */
export function useAuthInit() {
  const setAuthUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setProfileLoading = useAuthStore((state) => state.setProfileLoading);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const resetUser = useUserStore((state) => state.reset);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User signed in with Firebase Auth - set them as authenticated FIRST
        setAuthUser(firebaseUser);

        // Start loading user profile
        setProfileLoading(true);

        // Try to fetch user profile from Firestore
        try {
          const userProfile = await getUserById(firebaseUser.uid);
          setCurrentUser(userProfile);
        } catch (error) {
          // Profile doesn't exist yet (new user in ProfileSetup flow)
          // Keep Firebase user authenticated, but profile remains empty
          console.log('User profile not found - likely in setup process');
          resetUser();
        } finally {
          setProfileLoading(false);
        }
      } else {
        // User signed out
        setAuthUser(null);
        resetUser();
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setAuthUser, setLoading, setProfileLoading, setCurrentUser, resetUser]);
}
```

**Key Enhancement**: Separate `isProfileLoading` state prevents the auth screen from flashing when the Firestore profile is being fetched but the user is already authenticated with Firebase Auth.

### Testing Requirements

- [x] Google Sign-In flow works on both iOS and Android
- [x] New users navigate to ProfileSetupScreen after sign-in
- [x] Existing users proceed directly to main app
- [x] User handles are validated and unique
- [x] Handle suggestions are relevant and helpful
- [x] Profile photo upload works from gallery
- [x] Auth state persists across app restarts
- [x] Sign out functionality works correctly
- [x] Real-time handle validation provides immediate feedback
- [x] Loading states prevent UI flickering

### Success Criteria

- [x] Users can sign in with Google
- [x] User profiles are created and stored in Firestore
- [x] Auth state is managed in Zustand stores
- [x] Auth state persists correctly
- [x] Error handling is implemented
- [x] Profile setup provides smooth onboarding experience
- [x] Handle validation is robust and user-friendly

### ✅ Phase 1 Completed

**Completion Date**: November 20, 2025

**Deliverables**:
- ✅ **Google Sign-In authentication** with Firebase Auth
- ✅ **Smart auth flow**: Existing users → main app, new users → profile setup
- ✅ **Comprehensive ProfileSetupScreen** with:
  - Unique handle selection with real-time validation
  - Smart handle suggestions based on display name
  - Profile photo upload from gallery
  - Display name customization
  - Visual feedback (checkmarks, loading, errors)
  - Cannot be skipped or bypassed
- ✅ **User profile creation** and management in Firestore
- ✅ **Enhanced auth state management** with:
  - `authStore`: Firebase Auth state + separate profile loading state
  - `userStore`: Firestore user profile data
  - Prevents UI flickering during profile fetch
- ✅ **Reusable Input component** with left/right element support
- ✅ **Validation utilities**: Handle format, sanitization, suggestions
- ✅ **Firebase Storage integration**: Profile photo upload service
- ✅ **Auth initialization hook** with dual loading states
- ✅ **Navigation structure** separating auth and main app flows
- ✅ **Proper loading states** to eliminate auth flash issues
- ✅ **Error handling** throughout authentication flow
- ✅ **Firebase Security Rules** for authentication and user data
- ✅ **TypeScript types** for navigation and user models

**Key Architectural Decisions**:
1. **Merged Login into Welcome**: Simplified to single entry point
2. **ProfileSetupScreen replaces post-auth profile creation**: Better UX with guided onboarding
3. **Separate loading states**: `isLoading` (auth) vs `isProfileLoading` (profile fetch)
4. **Handle-first approach**: Users choose handle before accessing app (immutable)
5. **Smart validation**: Real-time feedback with suggestions improves success rate

**Files Created** (11 total):
- `src/screens/auth/WelcomeScreen.tsx`
- `src/screens/auth/ProfileSetupScreen.tsx`
- `src/components/common/Input.tsx`
- `src/utils/validation.ts`
- `src/services/firebase/storage.ts`
- `src/hooks/useAuthInit.ts`
- `src/stores/authStore.ts` (enhanced)
- `src/stores/userStore.ts`
- `src/navigation/AuthNavigator.tsx`
- `src/types/navigation.ts` (updated)
- `src/services/firebase/auth.ts`
- `src/services/firebase/firestore.ts`

**Next Steps**: Begin Phase 2 - Core Navigation & UI Structure

---

## Phase 2: Core Navigation & UI Structure

**Goal**: Complete reusable UI components library (navigation already implemented).

**Status**: ✅ 100% Complete

**Progress Summary**:
- ✅ **All Navigation** (100%) - AppNavigator, AuthNavigator, MainTabNavigator, 4 stack navigators
- ✅ **All Placeholder Screens** (100%) - EventsFeed, PeopleList, ChatList, Profile
- ✅ **All Common Components** (100%) - Input, Button, Avatar, Card

**What Changed from Original Plan**:
- Navigation was completed ahead of schedule during Phase 1 implementation
- Input component was created during Phase 1 to support ProfileSetupScreen
- Button, Avatar, and Card components completed to finalize Phase 2
- Chatroom screen moved to Phase 5 (Messaging Module) where it properly belongs

### 2.1 ✅ Navigation Setup (COMPLETED)

All navigation structure has been implemented:

**File**: `/src/navigation/AuthNavigator.tsx` ✅

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';
import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import ProfileSetupScreen from '@/screens/auth/ProfileSetupScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen 
        name="ProfileSetup" 
        component={ProfileSetupScreen}
        options={{
          headerShown: true,
          headerTitle: 'Setup Profile',
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
        }}
      />
    </Stack.Navigator>
  );
}
```

**File**: `/src/navigation/MainTabNavigator.tsx` ✅

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '@/types/navigation';
import EventsNavigator from './EventsNavigator';
import PeopleNavigator from './PeopleNavigator';
import ChatsNavigator from './ChatsNavigator';
import ProfileNavigator from './ProfileNavigator';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PeopleTab"
        component={PeopleNavigator}
        options={{
          tabBarLabel: 'People',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsNavigator}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MeTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Me',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

**Additional Navigators** (all completed):
- `EventsNavigator.tsx` ✅ - Stack navigator for Events tab
- `PeopleNavigator.tsx` ✅ - Stack navigator for People tab
- `ChatsNavigator.tsx` ✅ - Stack navigator for Chats tab
- `ProfileNavigator.tsx` ✅ - Stack navigator for Me/Profile tab (includes ComponentLibrary screen for development)

**Placeholder Screens** (all created, awaiting Phase 3+ implementation):
- `EventsFeedScreen.tsx` ✅ - Shows "Coming soon..."
- `PeopleListScreen.tsx` ✅ - Shows "Coming soon..."
- `ChatListScreen.tsx` ✅ - Shows "Coming soon..."
- `ProfileScreen.tsx` ✅ - Displays current user info + Sign Out + Component Library button

**File**: `/src/navigation/AppNavigator.tsx` ✅

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthInit } from '@/hooks/useAuthInit';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  // Initialize auth state listener
  useAuthInit();

  const { isAuthenticated, isLoading, isProfileLoading } = useAuthStore();
  const { currentUser } = useUserStore();

  // Show loading while auth is initializing OR profile is loading
  if (isLoading || isProfileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // User must be authenticated AND have a profile to access main app
  const hasCompletedOnboarding = isAuthenticated && currentUser !== null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Key Features**:
- **Dual loading check**: Shows loading during both auth initialization AND profile fetch
- **Onboarding gate**: Requires both Firebase Auth AND Firestore profile before main app access
- **Simplified structure**: Chatroom screen moved to Phase 5 (belongs in Messaging Module)
- **Smart routing**: New users stay in AuthNavigator until profile setup is complete

### 2.2 Common UI Components

**Status**: 4 of 4 components completed ✅

#### ✅ Input Component (COMPLETED in Phase 1)

Already implemented with full feature set. See Phase 1 section for details.

#### ✅ Button Component (COMPLETED)

**File**: `/src/components/common/Button.tsx`

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  text_primary: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.white,
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.primary,
  },
  textSize_sm: {
    fontSize: typography.fontSize.sm,
  },
  textSize_md: {
    fontSize: typography.fontSize.base,
  },
  textSize_lg: {
    fontSize: typography.fontSize.lg,
  },
});
```

#### ✅ Avatar Component (COMPLETED)

**File**: `/src/components/common/Avatar.tsx`

```typescript
import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography } from '@/theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  style?: ViewStyle;
}

export default function Avatar({
  uri,
  name,
  size = 40,
  style,
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  const textStyle = {
    fontSize: size * 0.4,
  };

  return (
    <View style={containerStyle}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Text style={[styles.initials, textStyle]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
});
```

#### ✅ Card Component (COMPLETED)

**File**: `/src/components/common/Card.tsx`

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export default function Card({ children, style, elevated = true }: CardProps) {
  return (
    <View style={[styles.card, elevated && shadows.md, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
```

### Testing Requirements

- [x] Navigation flows correctly between screens
- [x] Tab navigation works on both platforms
- [x] Tab icons display correctly with Ionicons
- [x] Auth flow properly gates main app access
- [x] Loading states prevent screen flickering
- [x] Input component renders consistently
- [x] Button component renders consistently
- [x] Avatar component renders consistently
- [x] Card component renders consistently
- [x] All components are reusable and customizable

### Success Criteria

- [x] Complete navigation structure implemented
- [x] All navigators connected properly
- [x] Auth flow and main app flow separated
- [x] Placeholder screens created for all tabs
- [x] Input component created and functional
- [x] Button component created with all variants
- [x] Avatar component created with online status
- [x] Card component created with elevation options
- [x] Consistent styling across components

### ✅ Phase 2 Completed

**Completion Date**: November 20, 2025

**Deliverables** (100%):
- ✅ All navigation structure (AppNavigator, AuthNavigator, MainTabNavigator, 4 stack navigators)
- ✅ All placeholder screens (Events, People, Chats, Profile)
- ✅ All common components (Input, Button, Avatar, Card)
- ✅ Component examples screen (__examples__.tsx) accessible from Profile
- ✅ Component documentation (README.md) in common components folder
- ✅ Tab icons with Ionicons
- ✅ Proper loading states and auth gating
- ✅ Consistent styling across components using theme system

**Files Created/Modified** (Phase 2):
- `src/components/common/Button.tsx` - New
- `src/components/common/Avatar.tsx` - New
- `src/components/common/Card.tsx` - New
- `src/components/common/__examples__.tsx` - New (Component showcase)
- `src/components/common/README.md` - New (Documentation)
- `src/components/common/index.ts` - Updated (Added exports)
- `src/navigation/ProfileNavigator.tsx` - Updated (Added ComponentLibrary route)
- `src/screens/profile/ProfileScreen.tsx` - Updated (Added Component Library button)
- `src/types/navigation.ts` - Updated (Added ComponentLibrary to ProfileStackParamList)

**Components Created**:
1. **Input** - Fully-featured text input with left/right elements (Phase 1)
2. **Button** - 4 variants (primary, secondary, outline, ghost), 3 sizes, loading states
3. **Avatar** - Image or initials fallback, configurable size, online status indicator
4. **Card** - Container with elevation, border styling, configurable padding

**Key Features**:
- All components follow the established design system
- TypeScript types for all props
- Reusable and customizable
- Consistent styling with theme constants
- Platform-agnostic (works on iOS, Android, Web)

**Developer Tools**:
- ✅ **Component Library Screen** (`__examples__.tsx`) - Showcases all UI components with live examples
  - Accessible from Profile screen via "View Component Library" button
  - Displays all button variants, avatar options, card styles, and input configurations
  - Includes a combined example showing components working together
  - Useful for development, design reference, and QA testing
- ✅ **Component Documentation** (`README.md`) - Comprehensive usage guide for all common components

**Next Steps**: Begin Phase 3 - Events Module

---

## Phase 3: Events Module

**Goal**: Implement event creation, browsing, and participation features.

**Prerequisites** (Completed in previous phases):
- ✅ Firebase Firestore service configured
- ✅ Event types defined in `/src/types/models.ts`
- ✅ UI components available (Button, Card, Avatar, Input)
- ✅ EventsNavigator with EventsFeedScreen placeholder
- ✅ Navigation structure in place

**What's New in Phase 3:**
- Events service layer (CRUD operations)
- Events Zustand store
- Full implementation of EventsFeedScreen
- New EventDetailsScreen (modal)
- New CreateEventScreen (modal)
- Event filtering and participation logic

### Tasks

#### 3.1 Events Service

**File**: `/src/services/events/eventsService.ts`

```typescript
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
  data: Partial<Event>
): Promise<void> {
  const eventRef = doc(firestore, EVENTS_COLLECTION, eventId);

  await updateDoc(eventRef, {
    ...data,
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
```

#### 3.2 Events Store

**File**: `/src/stores/eventsStore.ts`

```typescript
import { create } from 'zustand';
import { Event } from '@/types/models';

type EventFilter = 'all' | 'public' | 'friends' | 'invited' | 'myEvents';

interface EventsState {
  // State
  events: Event[];
  selectedEvent: Event | null;
  filter: EventFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, data: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  setSelectedEvent: (event: Event | null) => void;
  setFilter: (filter: EventFilter) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  filter: 'all',
  isLoading: false,
  error: null,

  // Actions
  setEvents: (events) => set({ events, isLoading: false, error: null }),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events],
    })),

  updateEvent: (eventId, data) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...data } : event
      ),
      selectedEvent:
        state.selectedEvent?.id === eventId
          ? { ...state.selectedEvent, ...data }
          : state.selectedEvent,
    })),

  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
      selectedEvent:
        state.selectedEvent?.id === eventId ? null : state.selectedEvent,
    })),

  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

  setFilter: (filter) => set({ filter }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      events: [],
      selectedEvent: null,
      filter: 'all',
      isLoading: false,
      error: null,
    }),
}));
```

#### 3.3 Events Screens

**Status**: EventsFeedScreen already exists as placeholder

**Screens to implement:**
- ✅ `/src/screens/events/EventsFeedScreen.tsx` - Already exists, needs full implementation
- ⏳ `/src/screens/events/EventDetailsScreen.tsx` - Create new
- ⏳ `/src/screens/events/CreateEventScreen.tsx` - Create new

**Available Components** (from Phase 2):
- `Button` - Use for "Join Event", "Create Event", "Leave Event" actions
- `Card` - Use for event list items and event detail sections
- `Avatar` - Use for displaying event creator and participants
- `Input` - Use for event creation form (title, description, location)

**Implementation Requirements:**
- EventsFeedScreen should display events in scrollable list with filters
- EventDetailsScreen should show full event info with participant list
- CreateEventScreen should have form with validation for all event fields
- Use established UI components for consistency
- Follow theme system for styling

#### 3.4 UI Component Usage in Events Module

**EventsFeedScreen Example:**

```typescript
import React, { useEffect } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Card, Avatar, Button } from '@/components/common';
import { useEventsStore } from '@/stores/eventsStore';
import { useUserStore } from '@/stores/userStore';
import { colors, typography, spacing } from '@/theme';

export default function EventsFeedScreen({ navigation }) {
  const events = useEventsStore((state) => state.events);
  const currentUser = useUserStore((state) => state.currentUser);

  const renderEventCard = ({ item: event }) => {
    const isParticipant = event.participants.includes(currentUser?.id);
    const isCreator = event.createdBy === currentUser?.id;

    return (
      <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Avatar 
            name={event.creatorName} 
            uri={event.creatorAvatar}
            size={40}
          />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{formatDate(event.startsAt)}</Text>
            <Text style={styles.eventLocation}>{event.locationName}</Text>
          </View>
        </View>
        
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
        
        <View style={styles.participants}>
          <Text style={styles.participantCount}>
            {event.participants.length} riders going
          </Text>
        </View>
        
        <View style={styles.actions}>
          <Button 
            title="View Details"
            onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
            variant="outline"
            size="sm"
            style={styles.detailsButton}
          />
          {!isCreator && (
            <Button 
              title={isParticipant ? "Leave" : "Join"}
              onPress={() => handleToggleParticipation(event.id)}
              variant={isParticipant ? "ghost" : "primary"}
              size="sm"
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}
```

**CreateEventScreen Example:**

```typescript
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Input, Button } from '@/components/common';
import { colors, spacing } from '@/theme';

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    location: '',
  });

  const handleCreateEvent = async () => {
    // Validation and creation logic
    setIsCreating(true);
    try {
      await createEvent(currentUser.id, {
        title,
        description,
        locationName: location,
        // ... other fields
      });
      navigation.goBack();
    } catch (error) {
      // Handle error
    } finally {
      setIsCreating(false);
    }
  };

  const isValid = title.length >= 3 && description.length >= 10 && location.length >= 3;

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Event Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Weekend Ride to Big Sur"
        error={errors.title}
        helperText="Give your event a catchy title"
      />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your event..."
        multiline
        numberOfLines={4}
        error={errors.description}
      />

      <Input
        label="Location"
        value={location}
        onChangeText={setLocation}
        placeholder="Meeting point"
        error={errors.location}
      />

      <Button
        title="Create Event"
        onPress={handleCreateEvent}
        isLoading={isCreating}
        disabled={!isValid}
        style={styles.createButton}
      />
    </ScrollView>
  );
}
```

**EventDetailsScreen Example:**

```typescript
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card, Avatar, Button } from '@/components/common';

export default function EventDetailsScreen({ route }) {
  const { eventId } = route.params;
  const event = useEventsStore((state) => 
    state.events.find(e => e.id === eventId)
  );

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>
      </Card>

      <Card elevated={false}>
        <Text style={styles.sectionTitle}>Participants</Text>
        <View style={styles.participantList}>
          {event.participants.map(participant => (
            <Avatar 
              key={participant.id}
              name={participant.name}
              uri={participant.avatarUrl}
              size={50}
              style={styles.participantAvatar}
            />
          ))}
        </View>
      </Card>

      <Button 
        title="Join This Event"
        onPress={handleJoin}
        style={styles.joinButton}
      />
    </ScrollView>
  );
}
```

#### 3.5 Navigation Updates

**Status**: EventsNavigator already exists with EventsFeed route

**Updates needed:**
- Add `EventDetails` modal screen to EventsNavigator
- Add `CreateEvent` modal screen to EventsNavigator

**File**: `/src/navigation/EventsNavigator.tsx`

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from '@/types/navigation';
import EventsFeedScreen from '@/screens/events/EventsFeedScreen';
import EventDetailsScreen from '@/screens/events/EventDetailsScreen'; // NEW
import CreateEventScreen from '@/screens/events/CreateEventScreen'; // NEW
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="EventsFeed" 
        component={EventsFeedScreen}
        options={{ title: 'Events' }}
      />
      {/* NEW: Add these modal screens */}
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{ 
          presentation: 'modal',
          title: 'Event Details'
        }}
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{ 
          presentation: 'modal',
          title: 'Create Event'
        }}
      />
    </Stack.Navigator>
  );
}
```

### Testing Requirements

**Functionality:**
- [x] Events can be created with all required fields
- [x] Events appear in the correct filtered views
- [x] Users can join and leave events
- [x] Event creators can edit and delete their events
- [x] Security rules prevent unauthorized access

**UI Components Integration:**
- [x] Button components respond correctly to loading/disabled states
- [x] Card components display event information clearly
- [x] Avatar components show event creator and participants
- [x] Input components validate event form fields correctly
- [x] All components follow theme styling consistently

**Navigation:**
- [x] EventsFeed → EventDetails navigation works
- [x] EventsFeed → CreateEvent navigation works
- [x] Modal screens dismiss correctly
- [x] Back navigation preserves state

### Success Criteria

- [x] Complete events CRUD operations
- [x] Events store manages state correctly
- [x] Events screens render and navigate properly
- [x] Event filtering works as expected
- [x] UI components used consistently throughout events module
- [x] Form validation prevents invalid event creation
- [x] Loading states provide clear user feedback

### ✅ Phase 3 Completed

**Completion Date**: November 20, 2025  
**Last Updated**: November 21, 2025

**Deliverables**:
- ✅ **Events Service Layer** (`eventsService.ts`) - Complete CRUD operations
  - Create, read, update, delete events
  - Join/leave event functionality
  - Public events, user events, participating events queries
  - Proper Firestore integration with timestamps
  - Banner image upload support
- ✅ **Events Store** (`eventsStore.ts`) - State management with filters
  - Events array, selected event, filter state
  - CRUD actions mirroring service layer
  - Error handling and loading states
- ✅ **CreateEventScreen** - Full-featured event creation & editing form
  - **Dual Mode**: Create new events OR edit existing events
  - Title, description, location inputs with validation
  - Date/time pickers (start/end) with platform-specific UI
  - **Banner Image Picker**: Select/crop images (16:9 aspect) from photo library
  - **Image Upload**: Firebase Storage integration with loading states
  - Visibility selector (Public/Friends/Invite Only)
  - Real-time validation and error messages
  - Auto-adjustment of end time based on start time
  - Dynamic screen title and button text based on mode
  - Pre-fills all fields when editing existing event
- ✅ **EventDetailsScreen** - Comprehensive event details
  - **Flat Card Design**: Modern UI without elevation
  - **Banner Image Display**: Full-width hero image (220px height)
  - Event information with icons (calendar, time, location)
  - Creator section with avatar
  - Participants grid with avatars
  - **Edit Event Button**: Navigates to CreateEventScreen in edit mode
  - Join/Leave button for participants
  - Delete button for creators with confirmation
  - **Auto-refresh**: Reloads data when navigating back from edit
  - Loading states for all actions
- ✅ **EventsFeedScreen** - Main events feed with filtering
  - Filter system (All/Public/Friends/My Events) with horizontal scroll
  - Event cards with creator info, description, location, participants
  - **Banner Images**: Displays event banners (180px height) with placeholders
  - **Consistent Card Heights**: Placeholder shown when no banner exists
  - Smart date/time formatting (relative and absolute)
  - "You're going" badge for joined events
  - "Past" badge for expired events
  - Pull-to-refresh functionality
  - **Auto-refresh on focus**: Updates when returning from event details
  - Empty states with CTAs
  - **Larger Header Button**: Prominent create button (32px icon) with proper alignment
- ✅ **EventsNavigator** - Updated with modal routes
  - EventDetails modal presentation
  - CreateEvent modal presentation with optional eventId param
- ✅ **Firebase Integration**:
  - **Storage Service**: `uploadEventImage()` for banner uploads
  - **Updated Security Rules**: `isJoiningOrLeaving()` helper function allows users to add/remove themselves from events
  - **Schema Updates**: Added `bannerImageUrl` field to events collection
- ✅ **Dependencies Installed**:
  - `expo-image-picker` for banner image selection (modern API)
  - `react-native-modal-datetime-picker` for improved date/time picking (replaced `@react-native-community/datetimepicker`)
- ✅ **Zero linter errors** - All code properly typed and formatted

**Files Created/Modified** (10 total):
- `src/services/events/eventsService.ts`
- `src/stores/eventsStore.ts`
- `src/screens/events/CreateEventScreen.tsx`
- `src/screens/events/EventDetailsScreen.tsx`
- `src/screens/events/EventsFeedScreen.tsx` (updated from placeholder)
- `src/screens/events/index.ts` (updated)
- `src/navigation/EventsNavigator.tsx` (updated)
- `src/types/navigation.ts` (updated - added eventId param to CreateEvent)
- `src/types/models.ts` (updated - added bannerImageUrl to Event)
- `docs/Firebase Schema.md` (updated - security rules and event schema)
- `docs/Phase3-Completion-Summary.md` (documentation)
- `docs/Phase4-Dependencies.md` (documentation)

**Key Features Implemented**:
1. **Complete Event Lifecycle**: Create → Browse → View Details → Join/Leave → **Edit** → Delete
2. **Banner Images**: Upload, crop (16:9), display in feed and details with placeholders
3. **Edit Mode**: Reusable CreateEventScreen for both creating and editing events
4. **Smart Filtering**: Multiple filter options with horizontal scrollable pills
5. **Rich UI**: Creator avatars, participant lists, location icons, date formatting, flat card design
6. **Form Validation**: Real-time validation with helpful error messages
7. **Loading States**: All async operations show loading indicators (including image upload)
8. **Date/Time Management**: Platform-specific pickers with validation
9. **Optimistic Updates**: Local state updates for instant feedback
10. **Auto-refresh**: Feed and details reload when navigating back from actions
11. **Empty States**: Helpful CTAs when no events exist
12. **Past Event Detection**: Visual badges for expired events
13. **Pull-to-Refresh**: Manual refresh capability
14. **Consistent UI**: Banner placeholders ensure uniform card heights

**Technical Achievements**:
- Proper Firestore timestamp handling
- Batch user data loading (creators, participants)
- Array union/remove for participant management
- Type-safe navigation and state management
- Reusable component library integration
- Theme system compliance throughout
- Firebase Storage integration for images
- Advanced security rules with join/leave logic
- Dual-mode screen architecture (create/edit)
- Focus-based auto-refresh patterns

**Post-Completion Enhancements** (November 21, 2025):
1. **Event Editing**:
   - Added Edit Event button in EventDetailsScreen for creators
   - Modified CreateEventScreen to support edit mode via optional eventId param
   - Pre-fills all fields when editing existing events
   - Dynamic screen title and button text based on mode
   - Separate validation for create vs edit (past events can be edited)

2. **Banner Images**:
   - Integrated expo-image-picker for image selection
   - 16:9 aspect ratio cropping with user-adjustable frame
   - Firebase Storage upload with progress indication
   - Display in EventsFeedScreen (180px) and EventDetailsScreen (220px)
   - Placeholder with icon for events without banners (consistent card heights)
   - Replaced deprecated MediaTypeOptions API with modern array syntax

3. **Security Rules Enhancement**:
   - Added `isJoiningOrLeaving()` helper function to security rules
   - Allows users to add/remove only themselves from participants array
   - Prevents users from manipulating other participants
   - Enables proper join/leave functionality

4. **UI/UX Improvements**:
   - Flat card design (elevated={false}) in EventDetailsScreen for cleaner look
   - Banner placeholders ensure consistent card heights in feed
   - Horizontal scrollable filter pills to prevent overflow
   - Larger create event button (32px) with balanced header alignment
   - Auto-refresh on navigation focus for feed and details screens
   - Loading state separation (form submission vs image upload)

**Phase 4 Dependencies**:

The following Events Module features are **stubbed out** and require Phase 4 (Social Module) completion:

- ⏳ **"All Events" Filter**: Shows "Coming in Phase 4" message
  - Blocked by production security rules requiring friend relationships
  - Function: `getAllEvents()` needs friend system to work with visibility rules
  
- ⏳ **"Friends Events" Filter**: Shows "Coming in Phase 4" message  
  - Requires friend relationships to query events from friends
  - Function: `getFriendsEvents()` stubbed in `eventsService.ts`

**Working Features** ✅:
- ✅ "Public Events" filter - fully functional
- ✅ "My Events" filter - fully functional  
- ✅ Event creation, details, join/leave - fully functional

See `docs/Phase4-Dependencies.md` for detailed implementation roadmap.

**Next Steps**: Begin Phase 4 - Social Module (Friend Management)

---

## Phase 4: Social Module

**Goal**: Implement friend management and social features.

### Tasks

#### 4.1 Friends Service

**File**: `/src/services/social/friendsService.ts`

```typescript
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
  // Add to both users' friends subcollections
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
 * Remove friend
 */
export async function removeFriend(
  userId: string,
  friendId: string
): Promise<void> {
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

  // Fetch friend user data
  const friendsData = await Promise.all(
    friendIds.map((friendId) => getUserById(friendId))
  );

  return friendsData.filter((friend): friend is User => friend !== null);
}

/**
 * Get pending friend requests
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
```

#### 4.2 Friends Store

**File**: `/src/stores/friendsStore.ts`

```typescript
import { create } from 'zustand';
import { User, FriendRequest } from '@/types/models';

interface FriendsState {
  // State
  friends: User[];
  friendRequests: FriendRequest[];
  searchResults: User[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setFriends: (friends: User[]) => void;
  addFriend: (friend: User) => void;
  removeFriend: (friendId: string) => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  removeFriendRequest: (requestId: string) => void;
  setSearchResults: (results: User[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  // Initial state
  friends: [],
  friendRequests: [],
  searchResults: [],
  isLoading: false,
  error: null,

  // Actions
  setFriends: (friends) => set({ friends, isLoading: false, error: null }),

  addFriend: (friend) =>
    set((state) => ({
      friends: [...state.friends, friend],
    })),

  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter((friend) => friend.id !== friendId),
    })),

  setFriendRequests: (friendRequests) =>
    set({ friendRequests, isLoading: false, error: null }),

  removeFriendRequest: (requestId) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((req) => req.id !== requestId),
    })),

  setSearchResults: (searchResults) => set({ searchResults }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      friends: [],
      friendRequests: [],
      searchResults: [],
      isLoading: false,
      error: null,
    }),
}));
```

### Testing Requirements

- [ ] Friend requests can be sent via handle
- [ ] Friend requests can be accepted/rejected
- [ ] Friends list displays correctly
- [ ] Users can remove friends
- [ ] Security rules prevent unauthorized friend management

### Success Criteria

- [ ] Complete friend management implemented
- [ ] Friends store manages state correctly
- [ ] Friend screens functional

---

## Phase 5: Messaging Module

**Goal**: Implement real-time messaging with DMs and group chats.

### Tasks

#### 5.1 Messaging Service

**File**: `/src/services/messaging/messagingService.ts`

```typescript
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  push,
  set,
  onValue,
  query as rtQuery,
  orderByChild,
  limitToLast,
  serverTimestamp as rtServerTimestamp,
  onDisconnect,
} from 'firebase/database';
import { firestore, realtimeDb } from '@/services/firebase/config';
import { Chat, Message } from '@/types/models';

/**
 * Create a new chat (DM or group)
 */
export async function createChat(
  participantIds: string[],
  isGroup: boolean,
  groupName?: string
): Promise<string> {
  // Check if DM already exists
  if (!isGroup && participantIds.length === 2) {
    const existingChat = await findExistingDM(participantIds);
    if (existingChat) {
      return existingChat.id;
    }
  }

  const chatData = {
    isGroup,
    name: isGroup ? groupName : null,
    participants: participantIds,
    admins: isGroup ? [participantIds[0]] : [],
    avatarUrl: null,
    lastMessageText: '',
    lastMessageSender: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  const chatRef = await addDoc(collection(firestore, 'chats'), chatData);

  return chatRef.id;
}

/**
 * Find existing DM between two users
 */
async function findExistingDM(participantIds: string[]): Promise<Chat | null> {
  const q = query(
    collection(firestore, 'chats'),
    where('isGroup', '==', false),
    where('participants', 'array-contains', participantIds[0])
  );

  const querySnapshot = await getDocs(q);

  const existingChat = querySnapshot.docs.find((doc) => {
    const chat = doc.data() as Chat;
    return chat.participants.includes(participantIds[1]);
  });

  if (existingChat) {
    return {
      id: existingChat.id,
      ...existingChat.data(),
    } as Chat;
  }

  return null;
}

/**
 * Get user's chats
 */
export async function getUserChats(userId: string): Promise<Chat[]> {
  const q = query(
    collection(firestore, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Chat[];
}

/**
 * Send a message
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video',
  replyTo?: string
): Promise<string> {
  // Add message to Realtime Database
  const messageRef = push(ref(realtimeDb, `messages/${chatId}`));

  const messageData = {
    senderId,
    text,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || null,
    timestamp: rtServerTimestamp(),
    reactions: {},
    replyTo: replyTo || null,
    status: 'sent',
  };

  await set(messageRef, messageData);

  // Update chat metadata in Firestore
  await updateDoc(doc(firestore, 'chats', chatId), {
    lastMessageText: text || '📷 Photo',
    lastMessageSender: senderId,
    lastMessageAt: serverTimestamp(),
  });

  return messageRef.key!;
}

/**
 * Listen to messages in a chat
 */
export function listenToMessages(
  chatId: string,
  callback: (messages: Message[]) => void,
  limitCount = 50
): () => void {
  const messagesRef = ref(realtimeDb, `messages/${chatId}`);
  const messagesQuery = rtQuery(
    messagesRef,
    orderByChild('timestamp'),
    limitToLast(limitCount)
  );

  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    const messages: Message[] = [];

    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });

    callback(messages);
  });

  return unsubscribe;
}

/**
 * Set typing indicator
 */
export async function setTypingIndicator(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const typingRef = ref(realtimeDb, `typing/${chatId}/${userId}`);

  if (isTyping) {
    await set(typingRef, {
      isTyping: true,
      timestamp: rtServerTimestamp(),
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      set(typingRef, {
        isTyping: false,
        timestamp: rtServerTimestamp(),
      });
    }, 3000);
  } else {
    await set(typingRef, {
      isTyping: false,
      timestamp: rtServerTimestamp(),
    });
  }
}

/**
 * Listen to typing indicators
 */
export function listenToTyping(
  chatId: string,
  callback: (typingUsers: string[]) => void
): () => void {
  const typingRef = ref(realtimeDb, `typing/${chatId}`);

  const unsubscribe = onValue(typingRef, (snapshot) => {
    const typingUsers: string[] = [];

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.isTyping) {
        typingUsers.push(childSnapshot.key!);
      }
    });

    callback(typingUsers);
  });

  return unsubscribe;
}

/**
 * Set user presence
 */
export function setUserPresence(userId: string): () => void {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);
  const connectedRef = ref(realtimeDb, '.info/connected');

  // When user connects, set online status
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      // Set online status
      set(presenceRef, {
        state: 'online',
        lastChanged: rtServerTimestamp(),
      });

      // When user disconnects, set offline status
      onDisconnect(presenceRef).set({
        state: 'offline',
        lastChanged: rtServerTimestamp(),
      });
    }
  });

  return unsubscribe;
}

/**
 * Listen to user presence
 */
export function listenToPresence(
  userId: string,
  callback: (isOnline: boolean) => void
): () => void {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);

  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    callback(data?.state === 'online');
  });

  return unsubscribe;
}
```

#### 5.2 Chats Store

**File**: `/src/stores/chatsStore.ts`

```typescript
import { create } from 'zustand';
import { Chat, Message } from '@/types/models';

interface ChatsState {
  // State
  chats: Chat[];
  selectedChat: Chat | null;
  messages: { [chatId: string]: Message[] };
  typingUsers: { [chatId: string]: string[] };
  isLoading: boolean;
  error: string | null;

  // Actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, data: Partial<Chat>) => void;
  setSelectedChat: (chat: Chat | null) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  setTypingUsers: (chatId: string, users: string[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useChatsStore = create<ChatsState>((set) => ({
  // Initial state
  chats: [],
  selectedChat: null,
  messages: {},
  typingUsers: {},
  isLoading: false,
  error: null,

  // Actions
  setChats: (chats) => set({ chats, isLoading: false, error: null }),

  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats],
    })),

  updateChat: (chatId, data) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...data } : chat
      ),
      selectedChat:
        state.selectedChat?.id === chatId
          ? { ...state.selectedChat, ...data }
          : state.selectedChat,
    })),

  setSelectedChat: (selectedChat) => set({ selectedChat }),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  setTypingUsers: (chatId, users) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: users,
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      chats: [],
      selectedChat: null,
      messages: {},
      typingUsers: {},
      isLoading: false,
      error: null,
    }),
}));
```

### Testing Requirements

- [ ] Messages send and receive in real-time
- [ ] Typing indicators work correctly
- [ ] DMs and group chats function properly
- [ ] Message history loads correctly
- [ ] Media messages supported
- [ ] Presence detection works

### Success Criteria

- [ ] Real-time messaging working
- [ ] Chat list updates automatically
- [ ] Typing indicators functional
- [ ] Presence detection active

---

## Phase 6: Profile & Settings

**Goal**: Implement user profile management and app settings.

### Tasks

Create the following screens with profile management features:
- `/src/screens/profile/ProfileScreen.tsx` - Display user profile
- `/src/screens/profile/SettingsScreen.tsx` - App settings
- `/src/screens/profile/AboutScreen.tsx` - About and privacy policy

Include features:
- Edit profile (name, bio, avatar)
- Upload avatar to Firebase Storage
- App preferences
- Sign out functionality

### Success Criteria

- [ ] Users can view and edit their profiles
- [ ] Avatar upload works
- [ ] Settings are persisted
- [ ] Sign out works correctly

---

## Phase 7: Push Notifications

**Goal**: Implement push notifications for messages, events, and friend requests.

### Tasks

#### 7.1 FCM Setup

**File**: `/src/services/firebase/notifications.ts`

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { env } from 'expo-env';
import { firestore } from './config';

/**
 * Configure notifications
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification');
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: env.PROJECT_ID,
    })
  ).data;

  // Save token to user document
  await updateDoc(doc(firestore, 'users', userId), {
    pushToken: token,
  });

  // Configure Android channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });
  }

  return token;
}

/**
 * Listen for notifications
 */
export function listenToNotifications(
  callback: (notification: Notifications.Notification) => void
) {
  const subscription = Notifications.addNotificationReceivedListener(callback);

  return () => subscription.remove();
}

/**
 * Listen for notification responses
 */
export function listenToNotificationResponses(
  callback: (response: Notifications.NotificationResponse) => void
) {
  const subscription =
    Notifications.addNotificationResponseReceivedListener(callback);

  return () => subscription.remove();
}
```

#### 7.2 Cloud Functions for Notifications

Create Firebase Cloud Functions to send notifications:
- New message notification
- Event invitation notification
- Friend request notification

*Note: This requires setting up Firebase Cloud Functions in a separate repository or directory.*

### Success Criteria

- [ ] Push notifications work on both platforms
- [ ] Notifications trigger correctly for events
- [ ] Notification handling works in-app and when app is closed

---

## Phase 8: Testing & Quality Assurance

**Goal**: Ensure app quality through comprehensive testing.

### Tasks

#### 8.1 Unit Tests

Create unit tests for:
- Zustand stores
- Firebase service functions
- Utility functions

#### 8.2 Integration Tests

Test:
- Authentication flows
- Data synchronization
- Real-time features

#### 8.3 Manual Testing Checklist

- [ ] Authentication (sign in, sign out, persistence)
- [ ] Events (create, join, leave, edit, delete)
- [ ] Friends (add, remove, requests)
- [ ] Messaging (send, receive, typing, presence)
- [ ] Profile (view, edit, avatar upload)
- [ ] Navigation (all flows)
- [ ] Error handling
- [ ] Offline behavior
- [ ] Performance (loading times, animations)

### Success Criteria

- [ ] All critical paths tested
- [ ] No major bugs or crashes
- [ ] App performs smoothly on both platforms

---

## Phase 9: Performance Optimization

**Goal**: Optimize app performance for production.

### Tasks

#### 9.1 Performance Improvements

- Implement pagination for events and messages
- Add image optimization and caching
- Optimize Firestore queries with indexes
- Implement lazy loading for screens
- Add request debouncing/throttling

#### 9.2 Bundle Size Optimization

- Analyze bundle size with `npx expo-doctor`
- Remove unused dependencies
- Enable Hermes engine for Android

### Success Criteria

- [ ] App loads quickly
- [ ] Smooth scrolling and animations
- [ ] Minimal network usage
- [ ] Optimized bundle size

---

## Phase 10: Production Deployment

**Goal**: Deploy app to production.

### Tasks

#### 10.1 Pre-deployment Checklist

- [ ] Environment variables configured for production
- [ ] Firebase Security Rules deployed
- [ ] Firebase indexes created
- [ ] App icons and splash screens finalized
- [ ] Privacy policy and terms of service added
- [ ] Analytics configured

#### 10.2 Build & Submit

**iOS Build**:
```bash
eas build --platform ios --profile production
```

**Android Build**:
```bash
eas build --platform android --profile production
```

**Submit to Stores**:
```bash
eas submit --platform ios
eas submit --platform android
```

#### 10.3 Post-deployment

- [ ] Monitor Firebase usage and costs
- [ ] Monitor crash reports
- [ ] Collect user feedback
- [ ] Plan for updates and new features

### Success Criteria

- [ ] App successfully deployed to App Store
- [ ] App successfully deployed to Google Play
- [ ] Monitoring and analytics active
- [ ] No critical production issues

---

## Best Practices & Guidelines

### Code Organization

1. **File Naming**: Use PascalCase for components, camelCase for utilities
2. **Imports**: Group imports (React, libraries, local)
3. **Type Safety**: Always define TypeScript types
4. **Comments**: Add JSDoc comments for functions

### State Management

1. **Zustand Stores**: Use slice pattern for large stores
2. **Selectors**: Use selectors to prevent unnecessary re-renders
3. **Side Effects**: Keep side effects in services, not stores

### Firebase Best Practices

1. **Security Rules**: Always test rules before deployment
2. **Queries**: Add indexes for compound queries
3. **Listeners**: Always unsubscribe from listeners
4. **Batch Operations**: Use batch writes for multiple updates

### UI/UX Guidelines

1. **Loading States**: Show loading indicators for async operations
2. **Error Messages**: Display user-friendly error messages
3. **Accessibility**: Add accessible labels and hints
4. **Responsive**: Test on different screen sizes

### Git Workflow

1. **Branches**: Feature branches from `main`
2. **Commits**: Descriptive commit messages
3. **Pull Requests**: Code review before merging
4. **Versioning**: Use semantic versioning

---

## Appendix

### Useful Commands

```bash
# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Check for issues
npx expo-doctor

# Build for production
eas build --platform all --profile production

# Update over-the-air
eas update --branch production
```

### Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://zustand.docs.pmnd.rs/)

### Troubleshooting

**Common Issues**:

1. **Google Sign-In not working**: Check SHA fingerprints in Firebase Console
2. **Firestore permission denied**: Review security rules
3. **Messages not syncing**: Check Realtime Database rules
4. **Build fails**: Clear cache with `npx expo start --clear`

---

**End of Implementation Plan**

This plan should be treated as a living document and updated as development progresses. Each phase can be adapted based on team capacity, priorities, and user feedback.

