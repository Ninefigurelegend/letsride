import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '@/types/navigation';
import {
  PeopleListScreen,
  AddFriendScreen,
  UserProfileScreen,
} from '@/screens/people';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<PeopleStackParamList>();

export default function PeopleNavigator() {
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
        name="PeopleList"
        component={PeopleListScreen}
        options={{ title: 'People' }}
      />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{
          presentation: 'modal',
          title: 'Add Friend',
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          presentation: 'modal',
          title: 'Profile',
        }}
      />
    </Stack.Navigator>
  );
}

