import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventsScreenProps } from '@/types/navigation';
import { Button, Card, Avatar } from '@/components/common';
import { colors, typography, spacing } from '@/theme';
import { getEventById, joinEvent, leaveEvent, deleteEvent } from '@/services/events/eventsService';
import { getUserById } from '@/services/firebase/firestore';
import { useUserStore } from '@/stores/userStore';
import { useEventsStore } from '@/stores/eventsStore';
import { Event, User } from '@/types/models';

export default function EventDetailsScreen({
  route,
  navigation,
}: EventsScreenProps<'EventDetails'>) {
  const { eventId } = route.params;
  const currentUser = useUserStore((state) => state.currentUser);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const removeEvent = useEventsStore((state) => state.removeEvent);

  const [event, setEvent] = useState<Event | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  // Reload event details when screen comes into focus (e.g., after editing)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEventDetails();
    });
    return unsubscribe;
  }, [navigation, eventId]);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);
      const eventData = await getEventById(eventId);

      if (!eventData) {
        Alert.alert('Error', 'Event not found', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      setEvent(eventData);

      // Load creator info
      const creatorData = await getUserById(eventData.createdBy);
      setCreator(creatorData);

      // Load participant info
      const participantPromises = eventData.participants.map((uid) =>
        getUserById(uid)
      );
      const participantData = await Promise.all(participantPromises);
      setParticipants(participantData.filter((p): p is User => p !== null));
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!currentUser || !event) return;

    const isParticipant = event.participants.includes(currentUser.id);
    const action = isParticipant ? 'leave' : 'join';

    setIsJoining(true);

    try {
      if (isParticipant) {
        await leaveEvent(eventId, currentUser.id);
        // Update local state
        const updatedParticipants = event.participants.filter(
          (id) => id !== currentUser.id
        );
        setEvent({ ...event, participants: updatedParticipants });
        setParticipants(participants.filter((p) => p.id !== currentUser.id));
        updateEvent(eventId, { participants: updatedParticipants });
      } else {
        await joinEvent(eventId, currentUser.id);
        // Update local state
        const updatedParticipants = [...event.participants, currentUser.id];
        setEvent({ ...event, participants: updatedParticipants });
        setParticipants([...participants, currentUser]);
        updateEvent(eventId, { participants: updatedParticipants });
      }
    } catch (error: any) {
      console.error(`Error ${action}ing event:`, error);
      Alert.alert('Error', `Failed to ${action} event`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteEvent(eventId);
              removeEvent(eventId);
              Alert.alert('Success', 'Event deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const isCreator = currentUser?.id === event.createdBy;
  const isParticipant = currentUser
    ? event.participants.includes(currentUser.id)
    : false;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Event Header */}
        <Card style={styles.headerCard} elevated={false}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.visibilityBadge}>
              <Text style={styles.visibilityText}>
                {event.visibility.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Creator */}
          {creator && (
            <View style={styles.creatorSection}>
              <Avatar uri={creator.avatarUrl} name={creator.name} size={40} />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorLabel}>Organized by</Text>
                <Text style={styles.creatorName}>{creator.name}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Banner Image */}
        {event.bannerImageUrl && (
          <Image
            source={{ uri: event.bannerImageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        )}

        {/* Event Details */}
        <Card style={styles.card} elevated={false}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Start</Text>
              <Text style={styles.detailText}>{formatDateTime(event.startsAt)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>End</Text>
              <Text style={styles.detailText}>{formatDateTime(event.endsAt)}</Text>
            </View>
          </View>

          <View style={[styles.detailRow, { marginBottom: 0 }]}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{event.locationName}</Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.card} elevated={false}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>
        </Card>

        {/* Participants */}
        <Card style={styles.card} elevated={false}>
          <Text style={styles.sectionTitle}>
            Riders Going ({participants.length})
          </Text>
          <View style={styles.participantsGrid}>
            {participants.map((participant) => (
              <View key={participant.id} style={styles.participantItem}>
                <Avatar
                  uri={participant.avatarUrl}
                  name={participant.name}
                  size={50}
                />
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.name}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isCreator && (
            <Button
              title={isParticipant ? 'Leave Event' : 'Join Event'}
              onPress={handleJoinLeave}
              isLoading={isJoining}
              disabled={isJoining}
              variant={isParticipant ? 'outline' : 'primary'}
            />
          )}

          {isCreator && (
            <View style={styles.creatorActions}>
              <Button
                title="Edit Event"
                onPress={() => navigation.navigate('CreateEvent', { eventId: event.id })}
                variant="primary"
              />
              <Button
                title="Delete Event"
                onPress={handleDeleteEvent}
                isLoading={isDeleting}
                disabled={isDeleting}
                variant="outline"
              />
            </View>
          )}
        </View>
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
  content: {
    padding: spacing.lg,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  bannerImage: {
    width: '100%',
    height: 220,
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  visibilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.gray200,
  },
  visibilityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorInfo: {
    marginLeft: spacing.md,
  },
  creatorLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  creatorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  participantItem: {
    alignItems: 'center',
    width: 70,
  },
  participantName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  creatorActions: {
    gap: spacing.md,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});

