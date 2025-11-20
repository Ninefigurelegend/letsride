import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthInit } from '@/hooks/useAuthInit';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  // Initialize auth state listener
  useAuthInit();

  const { isAuthenticated, isLoading, isProfileLoading } = useAuthStore();
  const { currentUser } = useUserStore();

  // Show loading while auth is initializing OR profile is loading
  if (isLoading || isProfileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // User must be authenticated AND have a profile to access main app
  const hasCompletedOnboarding = isAuthenticated && currentUser !== null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

