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

### Expo Constants has been installed using
```bash
npx expo install expo-constants
```

Environment variables are accessed via `app.config.ts` and `Constants.expoConfig.extra`.

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
import Constants from "expo-constants";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
    projectId: Constants.expoConfig?.extra?.firebaseProjectId,
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
    appId: Constants.expoConfig?.extra?.firebaseAppId,
    measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

### App Configuration (app.config.ts)

The app uses Expo's app config to manage environment variables. Create a `.env` file in the root directory with your Firebase credentials:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
PROJECT_ID=your_expo_project_id
```

These variables are loaded into `app.config.ts` and accessed throughout the app using `Constants.expoConfig.extra`.

### Expo Auth Session has been installed using
```bash
npx expo install expo-auth-session
```

### Google Sign-In has been installed using
```bash
npm install @react-native-google-signin/google-signin
```

## Auth Persistence

### AsyncStorage has been installed using
```bash
npx expo install @react-native-async-storage/async-storage
```

Required for Firebase Auth to persist authentication state across app restarts.

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

### Vector Icons have been installed using
```bash
npx expo install @expo/vector-icons
```

Used for tab bar icons and other UI elements throughout the app.

## Media Handling

### Media libraries have been installed using
```bash
npx expo install expo-image-picker expo-image expo-av expo-media-library
```

## Date & Time Pickers

### React Native DateTime Picker has been installed using
```bash
npx expo install @react-native-community/datetimepicker
```

Used for selecting dates and times when creating events. Provides platform-specific UI (iOS spinner, Android modal).