import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Navigator
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// Events Stack
export type EventsStackParamList = {
  EventsFeed: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
};

// People Stack
export type PeopleStackParamList = {
  PeopleList: undefined;
  AddFriend: undefined;
  UserProfile: { userId: string };
};

// Chats Stack
export type ChatsStackParamList = {
  ChatList: undefined;
  NewChat: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  About: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  PeopleTab: NavigatorScreenParams<PeopleStackParamList>;
  ChatsTab: NavigatorScreenParams<ChatsStackParamList>;
  MeTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Chatroom: { chatId: string; chatName: string };
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type EventsScreenProps<T extends keyof EventsStackParamList> =
  NativeStackScreenProps<EventsStackParamList, T>;

export type PeopleScreenProps<T extends keyof PeopleStackParamList> =
  NativeStackScreenProps<PeopleStackParamList, T>;

export type ChatsScreenProps<T extends keyof ChatsStackParamList> =
  NativeStackScreenProps<ChatsStackParamList, T>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

