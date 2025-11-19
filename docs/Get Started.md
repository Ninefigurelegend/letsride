# Installed Dependencies

## Accessing Environment Variables

### Expo Env has been installed using
```bash
npx expo install expo-env
```

## Firebase

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