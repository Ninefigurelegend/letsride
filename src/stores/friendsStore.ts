import { create } from 'zustand';
import { User, FriendRequest } from '@/types/models';

interface FriendsState {
  // State
  friends: User[];
  friendRequests: FriendRequest[];
  requestSenders: { [userId: string]: User }; // Cache of users who sent requests
  isLoading: boolean;
  error: string | null;

  // Actions
  setFriends: (friends: User[]) => void;
  addFriend: (friend: User) => void;
  removeFriend: (friendId: string) => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  removeFriendRequest: (requestId: string) => void;
  setRequestSender: (userId: string, user: User) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  // Initial state
  friends: [],
  friendRequests: [],
  requestSenders: {},
  isLoading: false,
  error: null,

  // Actions
  setFriends: (friends) => set({ friends, isLoading: false, error: null }),

  addFriend: (friend) =>
    set((state) => ({
      friends: [...state.friends, friend],
    })),

  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter((friend) => friend.id !== friendId),
    })),

  setFriendRequests: (friendRequests) =>
    set({ friendRequests, isLoading: false, error: null }),

  removeFriendRequest: (requestId) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((req) => req.id !== requestId),
    })),

  setRequestSender: (userId, user) =>
    set((state) => ({
      requestSenders: {
        ...state.requestSenders,
        [userId]: user,
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      friends: [],
      friendRequests: [],
      requestSenders: {},
      isLoading: false,
      error: null,
    }),
}));

