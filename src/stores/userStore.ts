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

