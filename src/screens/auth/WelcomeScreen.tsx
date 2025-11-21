import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthScreenProps } from '@/types/navigation';
import { signInWithGoogle } from '@/services/firebase/auth';
import { getUserById } from '@/services/firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { colors, typography, spacing } from '@/theme';

export default function WelcomeScreen({
  navigation,
}: AuthScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
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
        {/* Logo/Icon */}
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Title */}
        <Text style={styles.title}>LetsRide</Text>
        <Text style={styles.subtitle}>
          Connect with riders. Join events. Ride together.
        </Text>
      </View>
      
      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Continue with Google</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  actions: {
    paddingHorizontal: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.xs,
  },
});

