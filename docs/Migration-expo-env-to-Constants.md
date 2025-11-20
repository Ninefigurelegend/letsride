# Migration from expo-env to expo-constants

## Overview

This document describes the migration from `expo-env` to Expo's built-in `expo-constants` package for managing environment variables.

## Reason for Migration

`expo-env` was found to be incompatible with the current Expo setup. Expo provides a built-in solution using `app.config.ts` and `expo-constants` which is more reliable and better integrated.

## Changes Made

### 1. Package Changes

**Uninstalled:**
- `expo-env`

**Installed:**
- `expo-constants` (already included with Expo SDK)

### 2. New Files Created

#### `app.config.ts`
Created at project root to manage app configuration and environment variables:

```typescript
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // ... app configuration
  extra: {
    // Firebase Configuration
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ... other environment variables
  },
});
```

### 3. Files Modified

#### `/src/services/firebase/config.ts`

**Before:**
```typescript
import { env } from 'expo-env';

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  // ...
};
```

**After:**
```typescript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  // ...
};
```

#### `/src/services/firebase/auth.ts`

**Before:**
```typescript
import { env } from 'expo-env';

GoogleSignin.configure({
  webClientId: env.GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});
```

**After:**
```typescript
import Constants from 'expo-constants';

GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  offlineAccess: true,
});
```

### 4. Documentation Updated

- `docs/Get Started.md` - Updated environment variable setup instructions
- `docs/Phase1-Completion.md` - Updated with new environment variable access pattern

## Environment Variable Mapping

The following environment variables are mapped from `.env` to `app.config.ts`:

| .env Variable | app.config.ts extra key |
|--------------|-------------------------|
| `FIREBASE_API_KEY` | `firebaseApiKey` |
| `FIREBASE_AUTH_DOMAIN` | `firebaseAuthDomain` |
| `FIREBASE_DATABASE_URL` | `firebaseDatabaseUrl` |
| `FIREBASE_PROJECT_ID` | `firebaseProjectId` |
| `FIREBASE_STORAGE_BUCKET` | `firebaseStorageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | `firebaseMessagingSenderId` |
| `FIREBASE_APP_ID` | `firebaseAppId` |
| `FIREBASE_MEASUREMENT_ID` | `firebaseMeasurementId` |
| `GOOGLE_WEB_CLIENT_ID` | `googleWebClientId` |

## How to Use

### 1. Create .env File

Create a `.env` file in the project root:

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
```

### 2. Access Environment Variables

In your code:

```typescript
import Constants from 'expo-constants';

// Access any environment variable
const apiKey = Constants.expoConfig?.extra?.firebaseApiKey;
const clientId = Constants.expoConfig?.extra?.googleWebClientId;
```

### 3. Restart Development Server

After changing `.env` or `app.config.ts`, restart the dev server:

```bash
npx expo start --clear
```

## Benefits of This Approach

1. **Better Integration**: Native Expo solution, no third-party dependencies
2. **Type Safety**: Full TypeScript support with ExpoConfig types
3. **Reliability**: Well-tested and maintained by Expo team
4. **Flexibility**: Can mix static config with environment variables
5. **Build Support**: Works seamlessly with EAS Build

## Troubleshooting

### Environment Variables Not Loading

1. Ensure `.env` file is in project root
2. Restart development server with `--clear` flag
3. Verify variable names in `app.config.ts` match `.env`

### TypeScript Errors

If you see TypeScript errors about `Constants.expoConfig?.extra`, ensure:
- `expo-constants` is installed: `npx expo install expo-constants`
- Types are up to date: `npm install`

### Undefined Values

If environment variables are undefined:
1. Check `.env` file exists and has correct variable names
2. Verify `app.config.ts` is reading from `process.env` correctly
3. Ensure you're using optional chaining: `Constants.expoConfig?.extra?.variableName`

## Testing

All files have been updated and tested:
- ✅ No linter errors
- ✅ TypeScript compilation successful
- ✅ All imports updated correctly
- ✅ Documentation updated

## Files Summary

**Created:**
- `app.config.ts`
- `docs/Migration-expo-env-to-Constants.md`

**Modified:**
- `src/services/firebase/config.ts`
- `src/services/firebase/auth.ts`
- `docs/Get Started.md`
- `docs/Phase1-Completion.md`

**Removed:**
- `expo-env` package dependency

---

**Migration Status**: ✅ **COMPLETE**

**Date**: November 20, 2025

