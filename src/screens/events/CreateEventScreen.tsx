import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { EventsScreenProps } from '@/types/navigation';
import { Input, Button } from '@/components/common';
import { colors, typography, spacing } from '@/theme';
import { createEvent, getEventById, updateEvent } from '@/services/events/eventsService';
import { uploadEventImage } from '@/services/firebase/storage';
import { useUserStore } from '@/stores/userStore';
import { useEventsStore } from '@/stores/eventsStore';
import { EventVisibility } from '@/types/models';

export default function CreateEventScreen({
  navigation,
  route,
}: EventsScreenProps<'CreateEvent'>) {
  const { eventId } = route.params || {};
  const isEditMode = !!eventId;
  
  const currentUser = useUserStore((state) => state.currentUser);
  const addEvent = useEventsStore((state) => state.addEvent);
  const updateEventInStore = useEventsStore((state) => state.updateEvent);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [visibility, setVisibility] = useState<EventVisibility>('public');
  const [startsAt, setStartsAt] = useState(new Date(Date.now() + 3600000)); // 1 hour from now
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + 7200000)); // 2 hours from now
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditMode);
  const [bannerImageUri, setBannerImageUri] = useState<string | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    locationName: '',
    dates: '',
  });

  // Load event data if in edit mode
  useEffect(() => {
    if (isEditMode && eventId) {
      loadEventData();
    }
  }, [eventId, isEditMode]);

  // Update screen title based on mode
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Event' : 'Create Event',
    });
  }, [isEditMode, navigation]);

  const loadEventData = async () => {
    setIsLoadingEvent(true);
    try {
      const eventData = await getEventById(eventId!);
      if (eventData) {
        setTitle(eventData.title);
        setDescription(eventData.description);
        setLocationName(eventData.locationName);
        setVisibility(eventData.visibility);
        // Convert Firestore Timestamp to Date
        const startDate = (eventData.startsAt as any).toDate ? (eventData.startsAt as any).toDate() : new Date(eventData.startsAt as any);
        const endDate = (eventData.endsAt as any).toDate ? (eventData.endsAt as any).toDate() : new Date(eventData.endsAt as any);
        setStartsAt(startDate);
        setEndsAt(endDate);
        // Load existing banner image if available
        if (eventData.bannerImageUrl) {
          setExistingBannerUrl(eventData.bannerImageUrl);
        }
      } else {
        Alert.alert('Error', 'Event not found', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: '',
      description: '',
      locationName: '',
      dates: '',
    };

    if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (locationName.trim().length < 3) {
      newErrors.locationName = 'Location must be at least 3 characters';
    }

    // Only validate future dates when creating new events
    if (!isEditMode && startsAt <= new Date()) {
      newErrors.dates = 'Start time must be in the future';
    }

    if (endsAt <= startsAt) {
      newErrors.dates = 'End time must be after start time';
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === '');
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to add a banner image.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBannerImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeBannerImage = () => {
    setBannerImageUri(null);
    setExistingBannerUrl(null);
  };

  const handleCreateEvent = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      let bannerImageUrl: string | undefined = existingBannerUrl || undefined;

      if (isEditMode && eventId) {
        // Upload new banner image if selected
        if (bannerImageUri) {
          setIsUploadingImage(true);
          bannerImageUrl = await uploadEventImage(bannerImageUri, eventId);
          setIsUploadingImage(false);
        }

        // Edit existing event
        await updateEvent(eventId, {
          title: title.trim(),
          description: description.trim(),
          locationName: locationName.trim(),
          visibility,
          startsAt: startsAt as any,
          endsAt: endsAt as any,
          bannerImageUrl,
        });
        
        updateEventInStore(eventId, {
          title: title.trim(),
          description: description.trim(),
          locationName: locationName.trim(),
          visibility,
          startsAt: startsAt as any,
          endsAt: endsAt as any,
          bannerImageUrl: bannerImageUrl as any,
        });
        
        Alert.alert('Success', 'Event updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Create new event first to get the event ID
        const newEventId = await createEvent(currentUser.id, {
          title: title.trim(),
          description: description.trim(),
          locationName: locationName.trim(),
          visibility,
          startsAt,
          endsAt,
        });

        // Upload banner image if selected
        if (bannerImageUri) {
          setIsUploadingImage(true);
          bannerImageUrl = await uploadEventImage(bannerImageUri, newEventId);
          setIsUploadingImage(false);
          
          // Update event with banner URL
          await updateEvent(newEventId, { bannerImageUrl });
        }

        // Add to store (will be populated fully when feed refreshes)
        Alert.alert('Success', 'Event created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      Alert.alert('Error', error.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setIsCreating(false);
      setIsUploadingImage(false);
    }
  };

  const handleConfirmStartDate = (date: Date) => {
    setStartsAt(date);
    // Auto-adjust end time if it's before new start time
    if (endsAt <= date) {
      setEndsAt(new Date(date.getTime() + 3600000)); // 1 hour after start
    }
    setShowStartPicker(false);
  };

  const handleCancelStartDate = () => {
    setShowStartPicker(false);
  };

  const handleConfirmEndDate = (date: Date) => {
    setEndsAt(date);
    setShowEndPicker(false);
  };

  const handleCancelEndDate = () => {
    setShowEndPicker(false);
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isFormValid =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    locationName.trim().length >= 3 &&
    (isEditMode || startsAt > new Date()) &&
    endsAt > startsAt;

  if (isLoadingEvent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Input
          label="Event Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Weekend Ride to Big Sur"
          error={errors.title}
          maxLength={100}
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your event..."
          error={errors.description}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <Input
          label="Meeting Location"
          value={locationName}
          onChangeText={setLocationName}
          placeholder="e.g., Starbucks on Main St"
          error={errors.locationName}
          maxLength={200}
        />

        {/* Banner Image Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Banner Image (Optional)</Text>
          {(bannerImageUri || existingBannerUrl) ? (
            <View style={styles.bannerContainer}>
              <Image
                source={{ uri: bannerImageUri || existingBannerUrl || '' }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeBannerButton}
                onPress={removeBannerImage}
              >
                <Ionicons name="close-circle" size={32} color={colors.surface} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.changeBannerButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={20} color={colors.surface} />
                <Text style={styles.changeBannerText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBannerButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.addBannerText}>Add Banner Image</Text>
              <Text style={styles.addBannerHint}>Recommended: 16:9 aspect ratio</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Visibility Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Event Visibility</Text>
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'public' && styles.visibilityOptionActive,
              ]}
              onPress={() => setVisibility('public')}
            >
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'public' && styles.visibilityTextActive,
                ]}
              >
                Public
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'friends' && styles.visibilityOptionActive,
              ]}
              onPress={() => setVisibility('friends')}
            >
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'friends' && styles.visibilityTextActive,
                ]}
              >
                Friends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'invite' && styles.visibilityOptionActive,
              ]}
              onPress={() => setVisibility('invite')}
            >
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'invite' && styles.visibilityTextActive,
                ]}
              >
                Invite Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date and Time Pickers */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDateTime(startsAt)}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={showStartPicker}
          mode="datetime"
          date={startsAt}
          onConfirm={handleConfirmStartDate}
          onCancel={handleCancelStartDate}
          minimumDate={new Date()}
        />

        <View style={styles.section}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDateTime(endsAt)}</Text>
          </TouchableOpacity>

          {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}
        </View>

        <DateTimePickerModal
          isVisible={showEndPicker}
          mode="datetime"
          date={endsAt}
          onConfirm={handleConfirmEndDate}
          onCancel={handleCancelEndDate}
          minimumDate={startsAt}
        />

        <Button
          title={
            isUploadingImage
              ? 'Uploading Image...'
              : isEditMode
              ? 'Update Event'
              : 'Create Event'
          }
          onPress={handleCreateEvent}
          isLoading={isCreating || isUploadingImage}
          disabled={!isFormValid || isCreating || isUploadingImage}
          style={styles.createButton}
        />

        <View style={styles.spacing} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  visibilityOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  visibilityText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  visibilityTextActive: {
    color: colors.white,
  },
  dateButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.sm,
  },
  createButton: {
    marginTop: spacing.lg,
  },
  spacing: {
    height: spacing.xl,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  removeBannerButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
  },
  changeBannerButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  changeBannerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.surface,
  },
  addBannerButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addBannerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  addBannerHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
});

