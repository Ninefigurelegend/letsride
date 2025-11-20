import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/types/navigation';
import EventsNavigator from './EventsNavigator';
import PeopleNavigator from './PeopleNavigator';
import ChatsNavigator from './ChatsNavigator';
import ProfileNavigator from './ProfileNavigator';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{
          tabBarLabel: 'Events',
        }}
      />
      <Tab.Screen
        name="PeopleTab"
        component={PeopleNavigator}
        options={{
          tabBarLabel: 'People',
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsNavigator}
        options={{
          tabBarLabel: 'Chats',
        }}
      />
      <Tab.Screen
        name="MeTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Me',
        }}
      />
    </Tab.Navigator>
  );
}

