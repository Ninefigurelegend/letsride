import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from '@/types/navigation';
import EventsFeedScreen from '@/screens/events/EventsFeedScreen';
import EventDetailsScreen from '@/screens/events/EventDetailsScreen';
import CreateEventScreen from '@/screens/events/CreateEventScreen';
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
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{ 
          presentation: 'modal',
          title: 'Event Details'
        }}
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{ 
          presentation: 'modal',
          title: 'Create Event'
        }}
      />
    </Stack.Navigator>
  );
}

