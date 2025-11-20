# Project Setup

> **Note**: For comprehensive project architecture and design decisions, see [Architecture.md](./Architecture.md)

## Expo Project Setup

### This repo has been created with 
```bash
npx create-expo-app . --template
```
where the typescript blank template was chosen

# Installed Dependencies

## Accessing Environment Variables

### Expo Env has been installed using
```bash
npx expo install expo-env
```
All required environment variables have been set.

## Firebase

### Setup has been completed on Firebase Console
Currently, the sign-in methods include:
- Google

Set up for the following app platforms have been completed:
- Android (with SHA fingerprints)
- Apple iOS
- Web

Config files have also been added.

### Firebase Services Enabled
- **Authentication**: Google Sign-In
- **Cloud Firestore**: Users, events, friendships, chat metadata
- **Realtime Database**: Real-time messaging, presence, typing indicators
- **Storage**: Profile pictures, event images, chat images/videos (WhatsApp-like media sharing)
- **Cloud Messaging (FCM)**: Push notifications for messages, events, friend requests
- **Cloud Functions**: Server-side logic, triggers, and background tasks
- **Analytics**: User engagement tracking

### Firebase has been installed using 
```bash
npm install firebase
```

### Firebase Setup Reference
```typescript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { env } from "expo-env";

// Your web app's Firebase envuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseenv = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseenv);
const analytics = getAnalytics(app);
```

### Expo Auth Session has been installed using
```bash
npx expo install expo-auth-session
```

### Google Sign-In has been installed using
```bash
npm install @react-native-google-signin/google-signin
```

## State Management

### Zustand has been installed using
```bash
npm install zustand
```

## Navigation

### React Navigation and dependencies have been installed using
```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/material-top-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-pager-view
```

## Media Handling

### Media libraries have been installed using
```bash
npx expo install expo-image-picker expo-image expo-av expo-media-library
```