import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AuthScreenProps } from '@/types/navigation';
import { signInWithGoogle } from '@/services/firebase/auth';
import { getUserById } from '@/services/firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { colors, typography, spacing } from '@/theme';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [isLoading, setIsLoading] = useState(false);
  const setAuthUser = useAuthStore((state) => state.setUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Sign in with Google
      const firebaseUser = await signInWithGoogle();
      
      // Check if user exists in Firestore
      const existingUser = await getUserById(firebaseUser.uid);
      
      if (existingUser) {
        // User exists, set user data
        setAuthUser(firebaseUser);
        setCurrentUser(existingUser);
      } else {
        // New user, navigate to profile setup
        navigation.navigate('ProfileSetup', {
          firebaseUserId: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Rider',
          photoURL: firebaseUser.photoURL || '',
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue to LetsRide
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              {/* Add Google icon here */}
              <Text style={styles.buttonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginLeft: spacing.sm,
  },
});

