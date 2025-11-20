import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PeopleStackParamList } from '@/types/navigation';
import PeopleListScreen from '@/screens/people/PeopleListScreen';
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
    </Stack.Navigator>
  );
}

