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
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const resetUser = useUserStore((state) => state.reset);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User signed in, fetch user profile
        try {
          const userProfile = await getUserById(firebaseUser.uid);
          setAuthUser(firebaseUser);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setAuthUser(null);
          resetUser();
        }
      } else {
        // User signed out
        setAuthUser(null);
        resetUser();
      }
    });

    return () => unsubscribe();
  }, [setAuthUser, setLoading, setCurrentUser, resetUser]);
}

