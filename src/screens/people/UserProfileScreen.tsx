import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { PeopleScreenProps } from '@/types/navigation';
import { Card, Avatar, Button } from '@/components/common';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/stores/userStore';
import { useFriendsStore } from '@/stores/friendsStore';
import { getUserById } from '@/services/firebase/firestore';
import { removeFriend } from '@/services/social/friendsService';
import { firestore } from '@/services/firebase/config';
import { colors, typography, spacing } from '@/theme';
import { User } from '@/types/models';

export default function UserProfileScreen({
  route,
  navigation,
}: PeopleScreenProps<'UserProfile'>) {
  const { userId } = route.params;
  const currentUser = useUserStore((state) => state.currentUser);
  const { friends, removeFriend: removeFriendFromStore } = useFriendsStore();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [statsPrivate, setStatsPrivate] = useState(false);

  const isFriend = friends.some((friend) => friend.id === userId);

  useEffect(() => {
    loadUser();
    loadUserStats();
  }, [userId]);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user profile');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Load friends count
      const friendsSnapshot = await getDocs(
        collection(firestore, `users/${userId}/friends`)
      );
      setFriendsCount(friendsSnapshot.size);

      // Load events joined count (events where user is a participant)
      const eventsQuery = query(
        collection(firestore, 'events'),
        where('participants', 'array-contains', userId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      setEventsCount(eventsSnapshot.size);
      setStatsPrivate(false);
    } catch (error: any) {
      console.error('Error loading user stats:', error);
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        setStatsPrivate(true);
      }
      // Leave stats at 0
    }
  };

  const handleRemoveFriend = () => {
    if (!user) return;

    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove @${user.handle} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser) return;

            setIsRemoving(true);
            try {
              await removeFriend(currentUser.id, userId);
              removeFriendFromStore(userId);

              Alert.alert('Friend Removed', 'You are no longer friends', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = () => {
    // TODO: Implement in Phase 5 (Messaging Module)
    Alert.alert(
      'Coming Soon',
      'Messaging will be available in the next update'
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar uri={user.avatarUrl} name={user.name} size={80} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.handle}>@{user.handle}</Text>
            {isFriend && (
              <View style={styles.friendBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.success}
                />
                <Text style={styles.friendBadgeText}>Friend</Text>
              </View>
            )}
          </View>
        </View>

        {user.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioLabel}>About</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}
      </Card>

      {/* Actions */}
      {isFriend && (
        <View style={styles.actionsSection}>
          <Button
            title="Send Message"
            onPress={handleSendMessage}
            variant="primary"
            style={styles.actionButton}
          />

          <Button
            title="Remove Friend"
            onPress={handleRemoveFriend}
            variant="outline"
            isLoading={isRemoving}
            style={styles.actionButton}
          />
        </View>
      )}

      {/* Stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Riding Stats</Text>
        {statsPrivate ? (
          <View style={styles.privateStats}>
            <Ionicons name="lock-closed-outline" size={32} color={colors.textSecondary} />
            <Text style={styles.privateText}>
              Stats are only visible to friends
            </Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.statValue}>{eventsCount}</Text>
              <Text style={styles.statLabel}>Events Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{friendsCount}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>
        )}
      </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  handle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: 4,
  },
  friendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  friendBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    marginLeft: 4,
    fontWeight: typography.fontWeight.medium,
  },
  bioSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bioLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bioText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  actionsSection: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  privateStats: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  privateText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

