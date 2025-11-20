import { useEffect } from 'react';
import { onAuthStateChange } from '@/services/firebase/auth';
import { getUserById } from '@/services/firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

/**
 * Initialize authentication state listener
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

