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

