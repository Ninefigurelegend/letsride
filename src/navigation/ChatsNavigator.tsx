import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatsStackParamList } from '@/types/navigation';
import ChatListScreen from '@/screens/chats/ChatListScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export default function ChatsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ title: 'Chats' }}
      />
    </Stack.Navigator>
  );
}

