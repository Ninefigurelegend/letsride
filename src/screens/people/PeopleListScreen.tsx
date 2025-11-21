import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { PeopleScreenProps } from '@/types/navigation';
import { Card, Avatar, Button } from '@/components/common';
import { Ionicons } from '@expo/vector-icons';
import { useFriendsStore } from '@/stores/friendsStore';
import { useUserStore } from '@/stores/userStore';
import {
  getFriends,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from '@/services/social/friendsService';
import { getUserById } from '@/services/firebase/firestore';
import { colors, typography, spacing } from '@/theme';
import { User, FriendRequest } from '@/types/models';

const Tab = createMaterialTopTabNavigator();

export default function PeopleListScreen({
  navigation,
}: PeopleScreenProps<'PeopleList'>) {
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('AddFriend')}
        >
          <Ionicons name="person-add" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          textTransform: 'none',
        },
      }}
    >
      <Tab.Screen name="Friends" component={FriendsTab} />
      <Tab.Screen name="Community" component={CommunityTab} />
    </Tab.Navigator>
  );
}

function FriendsTab({ navigation }: any) {
  const currentUser = useUserStore((state) => state.currentUser);
  const {
    friends,
    friendRequests,
    requestSenders,
    setFriends,
    setFriendRequests,
    setRequestSender,
    removeFriendRequest,
  } = useFriendsStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRequest, setIsLoadingRequest] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Load friends and requests in parallel
      const [friendsData, requestsData] = await Promise.all([
        getFriends(currentUser.id),
        getPendingFriendRequests(currentUser.id),
      ]);

      setFriends(friendsData);
      setFriendRequests(requestsData);

      // Load request sender data
      for (const request of requestsData) {
        const sender = await getUserById(request.fromUserId);
        if (sender) {
          setRequestSender(request.fromUserId, sender);
        }
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  }, [currentUser, setFriends, setFriendRequests, setRequestSender]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    if (!currentUser) return;

    setIsLoadingRequest(requestId);
    try {
      await acceptFriendRequest(currentUser.id, requestId, fromUserId);
      removeFriendRequest(requestId);

      // Reload friends to show the new friend
      const friendsData = await getFriends(currentUser.id);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setIsLoadingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!currentUser) return;

    setIsLoadingRequest(requestId);
    try {
      await rejectFriendRequest(currentUser.id, requestId);
      removeFriendRequest(requestId);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    } finally {
      setIsLoadingRequest(null);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => {
    const sender = requestSenders[item.fromUserId];
    if (!sender) return null;

    return (
      <Card style={styles.requestCard}>
        <View style={styles.requestContent}>
          <Avatar uri={sender.avatarUrl} name={sender.name} size={50} />
          <View style={styles.requestInfo}>
            <Text style={styles.requestName}>{sender.name}</Text>
            <Text style={styles.requestHandle}>@{sender.handle}</Text>
          </View>
        </View>
        <View style={styles.requestActions}>
          <Button
            title="Accept"
            onPress={() => handleAcceptRequest(item.id, item.fromUserId)}
            size="sm"
            variant="primary"
            isLoading={isLoadingRequest === item.id}
            style={styles.acceptButton}
          />
          <Button
            title="Reject"
            onPress={() => handleRejectRequest(item.id)}
            size="sm"
            variant="outline"
            disabled={isLoadingRequest === item.id}
          />
        </View>
      </Card>
    );
  };

  const renderFriend = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
    >
      <Card style={styles.friendCard}>
        <Avatar uri={item.avatarUrl} name={item.name} size={50} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendHandle}>@{item.handle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.gray400}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray400}
        />
      </View>

      <FlatList
        data={filteredFriends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          friendRequests.length > 0 ? (
            <View style={styles.requestsSection}>
              <Text style={styles.sectionTitle}>
                Friend Requests ({friendRequests.length})
              </Text>
              {friendRequests.map((request) => (
                <View key={request.id}>
                  {renderFriendRequest({ item: request })}
                </View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !searchQuery ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={64}
                color={colors.gray300}
              />
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start building your riding crew by adding friends
              </Text>
              <Button
                title="Add Friends"
                onPress={() => navigation.navigate('AddFriend')}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with a different name or handle
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

function CommunityTab() {
  return (
    <View style={styles.placeholderContainer}>
      <Ionicons name="people" size={64} color={colors.gray300} />
      <Text style={styles.placeholderTitle}>Communities Coming Soon</Text>
      <Text style={styles.placeholderSubtitle}>
        Discover and join motorcycle communities in your area
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    marginRight: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.md,
  },
  requestsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  requestCard: {
    marginBottom: spacing.md,
  },
  requestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  requestHandle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  friendHandle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  placeholderTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  placeholderSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

