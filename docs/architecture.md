# RideApp Architecture

## 1. Overview

RideApp is a social event mobile application for motorcyclists built with React Native (Expo), using Firebase as the backend infrastructure. The app enables users to create and join motorcycle events, connect with other riders, and communicate through direct and group messaging.

## 2. Tech Stack

### Frontend
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Styling**: React Native StyleSheets
- **Navigation**: React Navigation (with Tab and Stack navigators)
- **State Management**: Zustand

### Backend
- **Platform**: Firebase
  - **Authentication**: Firebase Auth (Google Sign-In)
  - **Database**: Cloud Firestore (primary database for users, events, friendships, chat metadata)
  - **Realtime Database**: Firebase Realtime Database (for real-time messaging, typing, and presence)
  - **Storage**: Firebase Storage (profile pictures, event images, chat images/videos)
  - **Cloud Messaging (FCM)**: Push notifications for messages, events, and friend requests
  - **Cloud Functions**: Firebase Cloud Functions (for server-side logic, triggers, data cleanup)
  - **Analytics**: Firebase Analytics

### Development Tools
- **Environment Variables**: expo-env
- **Firebase SDK**: firebase (includes Firestore, Auth, Storage, Realtime Database, Analytics)
- **Authentication**: 
  - expo-auth-session
  - @react-native-google-signin/google-signin
- **State Management**: zustand
- **Navigation**: 
  - @react-navigation/native
  - @react-navigation/native-stack
  - @react-navigation/bottom-tabs
  - @react-navigation/material-top-tabs
  - react-native-screens
  - react-native-safe-area-context
- **Media Handling**:
  - expo-image-picker (camera & gallery access)
  - expo-image (optimized image rendering with caching)
  - expo-av (video playback)
  - expo-media-library (save media)

## 3. App Navigation Structure

```
Authentication Flow (Stack Navigator)
├── Welcome Screen
├── Login Screen
└── Registration Screen
    └── First Time Setup (Profile creation)

Root Stack Navigator
├── Main Tabs (Bottom Tab Navigator)
│   ├── Events Tab (Stack)
│   │   ├── Events Feed Screen
│   │   ├── Event Details Modal
│   │   └── Create Event Modal
│   ├── People Tab (Stack)
│   │   ├── Friends/Community Top Tab Bar
│   │   ├── Friends List Screen
│   │   ├── Add Friend Modal
│   │   └── User Profile Modal
│   ├── Chats Tab (Stack)
│   │   ├── Chat List Screen
│   │   └── New Chat Modal (DM/Group selection)
│   └── Me Tab (Stack)
│       ├── Profile Screen
│       ├── App Settings Screen
│       └── About/Privacy Screen
└── Chatroom Screen (fullscreen, no tabs)
```

## 4. Core Features

### 4.1 Events Module
- **Event Discovery**: Browse events filtered by visibility (Public, Friends Only, Invitational, Created by Me)
- **Event Details**: View comprehensive event information
- **Event Creation**: Create events with details (title, description, date, time, location, visibility)
- **Event Participation**: Join/leave events

### 4.2 Social Module
- **Friend Management**: Add/remove friends via unique handles
- **Friend Search**: Filter friends by name
- **User Profiles**: View friend profiles with messaging option
- **Communities**: Placeholder for future community features

### 4.3 Messaging Module
- **Unified Chat List**: DMs and group chats displayed together, sorted by latest message (Discord-style)
- **Direct Messages**: 1-on-1 conversations with friends
- **Group Chats**: Multi-user conversations with multiple friends
- **Real-time Messaging**: Live message updates via Firebase Realtime Database
- **Rich Media Support**: 
  - Text messages
  - Image sharing (captured or from gallery)
  - Video sharing (captured or from gallery)
  - Emoji reactions (WhatsApp-style)
- **Message Features**:
  - Reply to messages
  - Read receipts (sent/delivered/read status)
  - Typing indicators

### 4.4 Profile Module
- **User Profile**: Personal information and settings
- **Authentication**: Secure login/registration with Google Sign-In
- **App Settings**: User preferences and configurations
- **About**: Privacy policy and app information

## 5. Data Models (Firebase Schema)

Refer to [Firebase Schema](./Firebase%20Schema.md) for detailed collection structures.

### Database Architecture
The app uses both Firestore and Realtime Database for optimal performance:

#### Firestore Collections (Structured Data)
- **users**: User profiles and metadata
- **events**: Event information and settings
- **friendships**: Friend relationships
- **chats**: Chat room metadata (participants, type, creation date)

#### Realtime Database (Real-time Data)
- **messages**: Individual chat messages (optimized for real-time updates)
- **presence**: User online/offline status
- **typing**: Typing indicators per chat room

### Chat List Sorting
Chats (both DMs and group chats) are displayed in a unified list, sorted by the timestamp of the most recent message in descending order (latest at top).

## 6. Key Design Patterns

### 6.1 Screen Types
- **Tab Screens**: Main navigation screens (Events, People, Chats, Me)
- **Stack Screens**: Nested navigation within tabs
- **Modals**: Overlay screens for creating/editing content

### 6.2 Component Architecture
- **Presentational Components**: Reusable UI components
- **Container Components**: Logic and state management
- **Custom Hooks**: Shared business logic
- **Zustand Stores**: Global state management (Auth, User, Events, Chats, etc.)

### 6.3 Data Flow
- **Zustand Stores**: Centralized state management
  - `useAuthStore`: Authentication state and user session
  - `useUserStore`: Current user profile data
  - `useEventsStore`: Events data and filters
  - `useChatsStore`: Chat rooms and messages
  - `useFriendsStore`: Friend list and relationships
- **Realtime Database Listeners**: Live message updates, typing indicators, presence
- **Firestore Listeners**: Real-time data synchronization for metadata
- **Firebase Storage**: Upload and retrieve media (images, videos)
- **Optimistic Updates**: Immediate UI feedback with background sync

## 7. Security Considerations

- **Authentication**: Firebase Auth with Google Sign-In
- **Authorization**: Firestore Security Rules for data access control
- **Data Validation**: Client-side and server-side validation
- **Privacy**: User visibility controls (public/friends/invitational)

## 8. Future Considerations

- **Push Notifications**: Event reminders and message alerts via Firebase Cloud Messaging (FCM)
- **Communities Feature**: Group-based interactions and community events
- **Location Services**: Route planning, GPS tracking, and live meetup coordinates
- **Event Media**: Photo/video uploads for events (event galleries)
- **Event Reviews**: Post-event ratings and feedback
- **Voice Messages**: Audio message support in chats
- **Message Search**: Search through chat history
- **Message Forwarding**: Forward messages to other chats

## 9. Development Workflow

### Environment Setup
- Development, staging, and production Firebase projects
- Environment-specific configuration via expo-env
- Platform-specific builds (iOS/Android) via EAS Build

### Testing Strategy
- Unit tests for business logic
- Component tests for UI elements
- Integration tests for Firebase interactions
- Manual testing for user flows

## 10. Project Structure

```
/src
├── /components       # Reusable UI components
│   ├── /common      # Shared components (Button, Input, Card)
│   ├── /events      # Event-specific components
│   ├── /social      # Social feature components
│   └── /messaging   # Chat components
├── /screens         # Screen components
│   ├── /auth        # Authentication screens
│   ├── /events      # Events tab screens
│   ├── /people      # People tab screens
│   ├── /chats       # Chats tab screens
│   └── /profile     # Me tab screens
├── /navigation      # Navigation configuration
├── /stores          # Zustand state stores
│   ├── authStore.ts
│   ├── userStore.ts
│   ├── eventsStore.ts
│   ├── chatsStore.ts
│   └── friendsStore.ts
├── /hooks           # Custom React hooks
├── /services        # Business logic and API calls
│   ├── /auth        # Authentication services
│   ├── /firestore   # Firestore operations (users, events, friendships)
│   ├── /realtime    # Realtime Database operations (messaging, presence)
│   └── /storage     # Firebase Storage operations (images, media)
├── /utils           # Helper functions
├── /types           # TypeScript type definitions
├── /constants       # App constants and configs
└── /theme           # Styling constants (colors, fonts, spacing)
```

---

*This architecture document will be expanded section by section as development progresses.*

