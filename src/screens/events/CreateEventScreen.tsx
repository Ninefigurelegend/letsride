import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EventsScreenProps } from '@/types/navigation';
import { Input, Button } from '@/components/common';
import { colors, typography, spacing } from '@/theme';
import { createEvent } from '@/services/events/eventsService';
import { useUserStore } from '@/stores/userStore';
import { useEventsStore } from '@/stores/eventsStore';
import { EventVisibility } from '@/types/models';

export default function CreateEventScreen({
  navigation,
}: EventsScreenProps<'CreateEvent'>) {
  const currentUser = useUserStore((state) => state.currentUser);
  const addEvent = useEventsStore((state) => state.addEvent);

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

  // Validation errors
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    locationName: '',
    dates: '',
  });

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

    if (startsAt <= new Date()) {
      newErrors.dates = 'Start time must be in the future';
    }

    if (endsAt <= startsAt) {
      newErrors.dates = 'End time must be after start time';
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === '');
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
      const eventId = await createEvent(currentUser.id, {
        title: title.trim(),
        description: description.trim(),
        locationName: locationName.trim(),
        visibility,
        startsAt,
        endsAt,
      });

      // Add to store (will be populated fully when feed refreshes)
      Alert.alert('Success', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartsAt(selectedDate);
      // Auto-adjust end time if it's before new start time
      if (endsAt <= selectedDate) {
        setEndsAt(new Date(selectedDate.getTime() + 3600000)); // 1 hour after start
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndsAt(selectedDate);
    }
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
    startsAt > new Date() &&
    endsAt > startsAt;

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

          {showStartPicker && (
            <DateTimePicker
              value={startsAt}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDateTime(endsAt)}</Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endsAt}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              minimumDate={startsAt}
            />
          )}

          {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}
        </View>

        <Button
          title="Create Event"
          onPress={handleCreateEvent}
          isLoading={isCreating}
          disabled={!isFormValid || isCreating}
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
});

