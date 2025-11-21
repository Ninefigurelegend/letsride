/**
 * EventsFeedScreen - Main events feed with filtering
 * 
 * STATUS: ✅ Fully implemented (Phase 3 + Phase 4 integration complete)
 * - All events filter: ✅ Working (public + friends + my events)
 * - Public events filter: ✅ Working
 * - Friends events filter: ✅ Working (Phase 4)
 * - Invited events filter: ✅ Working (Phase 4)
 * - My Events filter: ✅ Working
 * - Event creation: ✅ Working
 * - Event details navigation: ✅ Working
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventsScreenProps } from '@/types/navigation';
import { Button, Card, Avatar } from '@/components/common';
import { colors, typography, spacing } from '@/theme';
import {
  getAllEvents,
  getPublicEvents,
  getMyEvents,
  getMyParticipatingEvents,
  getFriendsEvents,
  getInvitedEvents,
} from '@/services/events/eventsService';
import { getUserById } from '@/services/firebase/firestore';
import { useEventsStore, EventFilter } from '@/stores/eventsStore';
import { useUserStore } from '@/stores/userStore';
import { Event, User } from '@/types/models';

type EventWithCreator = Event & {
  creatorName: string;
  creatorAvatar: string;
};

export default function EventsFeedScreen({
  navigation,
}: EventsScreenProps<'EventsFeed'>) {
  const currentUser = useUserStore((state) => state.currentUser);
  const events = useEventsStore((state) => state.events);
  const filter = useEventsStore((state) => state.filter);
  const setEvents = useEventsStore((state) => state.setEvents);
  const setFilter = useEventsStore((state) => state.setFilter);
  const setLoading = useEventsStore((state) => state.setLoading);

  const [eventsWithCreators, setEventsWithCreators] = useState<EventWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  // Reload events when screen comes into focus (e.g., after joining/leaving an event)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents();
    });
    return unsubscribe;
  }, [navigation, filter]);

  useEffect(() => {
    // Set header right button
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEvent', {})}
        >
          <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadEvents = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setLoading(true);

      let fetchedEvents: Event[] = [];

      switch (filter) {
        case 'public':
          fetchedEvents = await getPublicEvents();
          break;
        case 'myEvents':
          fetchedEvents = await getMyEvents(currentUser.id);
          break;
        case 'friends':
          fetchedEvents = await getFriendsEvents(currentUser.id);
          break;
        case 'invited':
          fetchedEvents = await getInvitedEvents(currentUser.id);
          break;
        case 'all':
          fetchedEvents = await getAllEvents(currentUser.id);
          break;
        default:
          fetchedEvents = await getPublicEvents();
          break;
      }

      setEvents(fetchedEvents);

      // Fetch creator info for each event
      const eventsWithCreatorInfo = await Promise.all(
        fetchedEvents.map(async (event) => {
          const creator = await getUserById(event.createdBy);
          return {
            ...event,
            creatorName: creator?.name || 'Unknown',
            creatorAvatar: creator?.avatarUrl || '',
          };
        })
      );

      setEventsWithCreators(eventsWithCreatorInfo);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [filter]);

  const formatDateTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      // Within a week
      return date.toLocaleString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getFilteredEvents = (): EventWithCreator[] => {
    if (!currentUser) return [];

    return eventsWithCreators.filter((event) => {
      switch (filter) {
        case 'public':
          return event.visibility === 'public';
        case 'friends':
          // getFriendsEvents() already returns the correct events
          return true;
        case 'invited':
          return event.invited?.includes(currentUser.id);
        case 'myEvents':
          return event.createdBy === currentUser.id;
        case 'all':
        default:
          return true;
      }
    });
  };

  const toDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  };

  const renderEventCard = ({ item: event }: { item: EventWithCreator }) => {
    if (!currentUser) return null;

    const isParticipant = event.participants.includes(currentUser.id);
    const isCreator = event.createdBy === currentUser.id;
    const isPast = toDate(event.endsAt) < new Date();

    return (
      <Card style={styles.eventCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.eventHeader}>
            <Avatar
              uri={event.creatorAvatar}
              name={event.creatorName}
              size={40}
            />
            <View style={styles.eventHeaderInfo}>
              <Text style={styles.creatorName}>{event.creatorName}</Text>
              <View style={styles.eventMeta}>
                <Text style={styles.metaText}>{formatDateTime(event.startsAt)}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{event.visibility}</Text>
              </View>
            </View>
            {isPast && (
              <View style={styles.pastBadge}>
                <Text style={styles.pastBadgeText}>Past</Text>
              </View>
            )}
          </View>

          {/* Banner Image or Placeholder */}
          {event.bannerImageUrl ? (
            <Image
              source={{ uri: event.bannerImageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Ionicons name="image-outline" size={48} color={colors.gray300} />
            </View>
          )}

          {/* Content */}
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>

            <View style={styles.eventLocation}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.locationText}>{event.locationName}</Text>
            </View>

            {/* Participants */}
            <View style={styles.participantsSection}>
              <Ionicons
                name="people-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.participantsText}>
                {event.participants.length} rider{event.participants.length !== 1 ? 's' : ''} going
              </Text>
              {isParticipant && (
                <View style={styles.goingBadge}>
                  <Text style={styles.goingBadgeText}>You're going</Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer - Action Button */}
          {!isPast && (
            <View style={styles.eventFooter}>
              <Button
                title="View Details"
                onPress={() =>
                  navigation.navigate('EventDetails', { eventId: event.id })
                }
                variant="outline"
                size="sm"
              />
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={80} color={colors.gray300} />
        <Text style={styles.emptyTitle}>No Events Found</Text>
        <Text style={styles.emptyText}>
          {filter === 'myEvents'
            ? "You haven't created any events yet."
            : filter === 'friends'
            ? "Your friends haven't created any events yet."
            : filter === 'invited'
            ? "You don't have any event invitations."
            : 'There are no events available at the moment.'}
        </Text>
        <Button
          title="Create Event"
          onPress={() => navigation.navigate('CreateEvent', {})}
          style={styles.createButton}
        />
      </View>
    );
  };

  const renderFilterButton = (
    filterValue: EventFilter,
    label: string,
    icon: keyof typeof Ionicons.glyphMap
  ) => {
    const isActive = filter === filterValue;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(filterValue)}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isActive ? colors.white : colors.textSecondary}
        />
        <Text
          style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const filteredEvents = getFilteredEvents();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {renderFilterButton('all', 'All', 'apps-outline')}
          {renderFilterButton('public', 'Public', 'globe-outline')}
          {renderFilterButton('friends', 'Friends', 'people-outline')}
          {renderFilterButton('invited', 'Invited', 'mail-outline')}
          {renderFilterButton('myEvents', 'My Events', 'person-outline')}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
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
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
  },
  eventCard: {
    marginBottom: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eventHeaderInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  creatorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  metaDot: {
    marginHorizontal: spacing.xs,
    color: colors.textSecondary,
  },
  pastBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  pastBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 180,
    marginBottom: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    marginBottom: spacing.md,
  },
  eventTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  eventDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing.sm,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  participantsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  participantsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  goingBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  goingBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  createButton: {
    minWidth: 200,
  },
});
