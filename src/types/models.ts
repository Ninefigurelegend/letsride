import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  blocked?: string[];
}

// Event Types
export type EventVisibility = 'public' | 'friends' | 'invite';

export interface Event {
  id: string;
  title: string;
  description: string;
  visibility: EventVisibility;
  createdBy: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  locationName: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
  participants: string[];
  invited?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Chat Types
export interface Chat {
  id: string;
  isGroup: boolean;
  name: string | null;
  participants: string[];
  admins?: string[];
  avatarUrl?: string | null;
  lastMessageText: string;
  lastMessageSender: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MediaType = 'image' | 'video' | null;

export interface Message {
  id: string;
  senderId: string;
  text: string | null;
  mediaUrl?: string | null;
  mediaType?: MediaType;
  timestamp: number;
  reactions?: { [userId: string]: string };
  replyTo?: string | null;
  status: MessageStatus;
}

// Friendship Types
export interface Friendship {
  userId: string;
  friendUserId: string;
  createdAt: Timestamp;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

// Presence Types
export interface Presence {
  state: 'online' | 'offline';
  lastChanged: number;
}

export interface TypingIndicator {
  isTyping: boolean;
  timestamp: number;
}

