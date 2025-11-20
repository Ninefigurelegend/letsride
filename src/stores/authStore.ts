import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  // State
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setProfileLoading: (isProfileLoading: boolean) => void;
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

