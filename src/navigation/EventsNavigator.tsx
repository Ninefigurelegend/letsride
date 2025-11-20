import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from '@/types/navigation';
import EventsFeedScreen from '@/screens/events/EventsFeedScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsNavigator() {
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
        name="EventsFeed" 
        component={EventsFeedScreen}
        options={{ title: 'Events' }}
      />
    </Stack.Navigator>
  );
}

