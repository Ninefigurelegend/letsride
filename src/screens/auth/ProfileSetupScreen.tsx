import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { AuthScreenProps } from '@/types/navigation';
import Input from '@/components/common/Input';
import { colors, typography, spacing } from '@/theme';
import { 
  validateHandleFormat, 
  sanitizeHandle,
  generateHandleSuggestions 
} from '@/utils/validation';
import {
  createUser,
  getUserById,
  isHandleAvailable,
} from '@/services/firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { getCurrentUser } from '@/services/firebase/auth';

export default function ProfileSetupScreen({
  route,
}: AuthScreenProps<'ProfileSetup'>) {
  const { firebaseUserId, displayName, photoURL } = route.params;
  
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const setAuthUser = useAuthStore((state) => state.setUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  useEffect(() => {
    // Generate initial suggestions based on display name
    const initialSuggestions = generateHandleSuggestions(displayName);
    setSuggestions(initialSuggestions);
  }, [displayName]);

  const checkHandleAvailability = async (handleToCheck: string) => {
    // Validate format first
    const validation = validateHandleFormat(handleToCheck);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid handle');
      return false;
    }

    // Check availability in Firestore
    setIsChecking(true);
    try {
      const available = await isHandleAvailable(handleToCheck);
      if (!available) {
        setError('This handle is already taken');
        return false;
      }
      setError('');
      return true;
    } catch (err) {
      console.error('Error checking handle:', err);
      setError('Failed to check availability');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleChangeText = (text: string) => {
    const sanitized = sanitizeHandle(text);
    setHandle(sanitized);
    
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  const handleBlur = () => {
    if (handle) {
      checkHandleAvailability(handle);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setHandle(suggestion);
    checkHandleAvailability(suggestion);
  };

  const handleContinue = async () => {
    if (!handle) {
      setError('Please enter a handle');
      return;
    }

    // Validate and check availability
    const isValid = await checkHandleAvailability(handle);
    if (!isValid) {
      return;
    }

    setIsCreating(true);
    try {
      // Create user document in Firestore
      await createUser(firebaseUserId, {
        handle,
        name: displayName,
        avatarUrl: photoURL,
        bio: '',
      });

      // Fetch the newly created user
      const newUser = await getUserById(firebaseUserId);
      
      // Get Firebase auth user and update stores
      const firebaseUser = getCurrentUser();
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        setCurrentUser(newUser);
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      Alert.alert('Profile Setup Failed', error.message || 'Please try again');
    } finally {
      setIsCreating(false);
    }
  };

  const isHandleValid = handle.length >= 3 && !error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Handle</Text>
          <Text style={styles.subtitle}>
            This is your unique username. You won't be able to change it later.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Handle"
            value={handle}
            onChangeText={handleChangeText}
            onBlur={handleBlur}
            placeholder="e.g., johnrider"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            leftElement={<Text style={styles.atSymbol}>@</Text>}
            rightElement={
              isChecking ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : isHandleValid ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : null
            }
            error={error}
            helperText="3-15 characters: lowercase letters, numbers, and underscores"
          />

          {suggestions.length > 0 && !handle && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>Suggestions:</Text>
              <View style={styles.suggestionsList}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSelectSuggestion(suggestion)}
                  >
                    <Text style={styles.suggestionText}>@{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isHandleValid || isCreating) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isHandleValid || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
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
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  form: {
    paddingHorizontal: spacing.xl,
  },
  atSymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  checkmark: {
    fontSize: typography.fontSize.xl,
    color: colors.success,
  },
  suggestions: {
    marginTop: spacing.lg,
  },
  suggestionsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

