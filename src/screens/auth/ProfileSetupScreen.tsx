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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
import { uploadProfilePhoto } from '@/services/firebase/storage';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { getCurrentUser } from '@/services/firebase/auth';

export default function ProfileSetupScreen({
  route,
}: AuthScreenProps<'ProfileSetup'>) {
  const { firebaseUserId, displayName, photoURL } = route.params;
  
  const [name, setName] = useState(displayName);
  const [handle, setHandle] = useState('');
  const [photoUri, setPhotoUri] = useState(photoURL);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload a profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleContinue = async () => {
    // Validate name
    if (!name || name.trim().length === 0) {
      Alert.alert('Name Required', 'Please enter your display name');
      return;
    }

    // Validate handle
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
      // Upload profile photo if changed from Google photo
      let finalAvatarUrl = photoURL;
      if (photoUri !== photoURL) {
        setIsUploadingPhoto(true);
        try {
          finalAvatarUrl = await uploadProfilePhoto(photoUri, firebaseUserId);
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          Alert.alert(
            'Photo Upload Failed',
            'Using default photo. You can change it later in settings.'
          );
          finalAvatarUrl = photoURL; // Fall back to Google photo
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      // Create user document in Firestore
      await createUser(firebaseUserId, {
        handle,
        name: name.trim(),
        avatarUrl: finalAvatarUrl,
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
  const canContinue = isHandleValid && name.trim().length > 0 && !isCreating && !isUploadingPhoto;

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
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Set up your profile to get started. Your handle cannot be changed later.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={styles.photoContainer}
              onPress={handlePickImage}
              disabled={isUploadingPhoto}
            >
              <Image
                source={{ uri: photoUri }}
                style={styles.photo}
              />
              {isUploadingPhoto && (
                <View style={styles.photoOverlay}>
                  <ActivityIndicator color={colors.white} />
                </View>
              )}
              <View style={styles.photoEditBadge}>
                <Text style={styles.photoEditIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Tap to change photo</Text>
          </View>

          {/* Display Name */}
          <Input
            label="Display Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Handle */}
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

          {/* Suggestions */}
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
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          {isCreating || isUploadingPhoto ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.white} size="small" />
              <Text style={styles.continueButtonText}>
                {isUploadingPhoto ? 'Uploading photo...' : 'Creating profile...'}
              </Text>
            </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
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
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.sm,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray200,
    borderWidth: 3,
    borderColor: colors.white,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  photoEditIcon: {
    fontSize: 18,
  },
  photoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
