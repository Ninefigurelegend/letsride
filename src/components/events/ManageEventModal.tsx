import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Card } from '@/components/common';
import { colors, typography, spacing } from '@/theme';
import { Event, User } from '@/types/models';
import { getFriends } from '@/services/social/friendsService';
import { getUserById } from '@/services/firebase/firestore';
import {
  removeParticipant,
  transferOwnership,
  addInvitedUsers,
  removeInvitedUser,
} from '@/services/events/eventsService';

type Tab = 'participants' | 'invite' | 'invited';

interface ManageEventModalProps {
  visible: boolean;
  onClose: () => void;
  event: Event;
  participants: User[];
  currentUserId: string;
  onUpdate: () => void; // Callback to refresh event data
}

export default function ManageEventModal({
  visible,
  onClose,
  event,
  participants,
  currentUserId,
  onUpdate,
}: ManageEventModalProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('participants');
  const [friends, setFriends] = useState<User[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingInvited, setIsLoadingInvited] = useState(false);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [invitedLoaded, setInvitedLoaded] = useState(false);

  // Reset cache when modal closes
  useEffect(() => {
    if (!visible) {
      setFriendsLoaded(false);
      setInvitedLoaded(false);
      setSelectedFriendIds(new Set());
      setActiveTab('participants');
    }
  }, [visible]);

  useEffect(() => {
    if (visible && activeTab === 'invite' && !friendsLoaded) {
      loadFriends();
    }
  }, [visible, activeTab, friendsLoaded]);

  useEffect(() => {
    if (visible && event.visibility === 'invite' && event.invited?.length && !invitedLoaded) {
      loadInvitedUsers();
    }
  }, [visible, event.visibility, event.invited, invitedLoaded]);

  const loadFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const friendsList = await getFriends(currentUserId);
      // Filter out only friends who are already participants
      // Keep invited friends to show their status
      const availableFriends = friendsList.filter(
        (friend) => !participants.some((p) => p.id === friend.id)
      );
      setFriends(availableFriends);
      setFriendsLoaded(true);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const loadInvitedUsers = async () => {
    setIsLoadingInvited(true);
    try {
      const participantIds = participants.map((p) => p.id);
      const invitedList = await Promise.all(
        (event.invited || []).map((userId) => getUserById(userId))
      );
      const filteredInvited = invitedList.filter(
        (u): u is User => !!u && !participantIds.includes(u.id)
      );
      setInvitedUsers(filteredInvited);
      setInvitedLoaded(true);
    } catch (error) {
      console.error('Error loading invited users:', error);
      Alert.alert('Error', 'Failed to load invited users');
    } finally {
      setIsLoadingInvited(false);
    }
  };

  const handleRemoveParticipant = (user: User) => {
    Alert.alert(
      'Remove Participant',
      `Are you sure you want to remove ${user.name} from this event?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeParticipant(event.id, user.id);
              setIsLoading(false);
              
              Alert.alert(
                'Success',
                `${user.name} has been removed`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onUpdate();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error removing participant:', error);
              setIsLoading(false);
              Alert.alert('Error', error.message || 'Failed to remove participant');
            }
          },
        },
      ]
    );
  };

  const handleTransferOwnership = (user: User) => {
    Alert.alert(
      'Transfer Ownership',
      `Are you sure you want to make ${user.name} the event organizer? You will no longer be able to edit or delete this event.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await transferOwnership(event.id, user.id);
              setIsLoading(false);
              
              Alert.alert(
                'Success',
                `${user.name} is now the event organizer`,
                [{ text: 'OK', onPress: () => { onUpdate(); onClose(); } }]
              );
            } catch (error: any) {
              console.error('Error transferring ownership:', error);
              setIsLoading(false);
              Alert.alert('Error', error.message || 'Failed to transfer ownership');
            }
          },
        },
      ]
    );
  };

  const toggleFriendSelection = (friendId: string) => {
    const newSelection = new Set(selectedFriendIds);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      newSelection.add(friendId);
    }
    setSelectedFriendIds(newSelection);
  };

  const handleInviteFriends = async () => {
    if (selectedFriendIds.size === 0) {
      Alert.alert('No Selection', 'Please select at least one friend to invite');
      return;
    }

    setIsLoading(true);
    try {
      await addInvitedUsers(event.id, Array.from(selectedFriendIds));
      const count = selectedFriendIds.size;
      
      setIsLoading(false);
      
      Alert.alert(
        'Success',
        `Invited ${count} friend${count > 1 ? 's' : ''} to the event`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedFriendIds(new Set());
              onUpdate();
              // Reset cache and reload to remove newly invited friends from list
              setFriendsLoaded(false);
              setInvitedLoaded(false);
              loadFriends();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error inviting friends:', error);
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to invite friends');
    }
  };

  const handleRemoveInvited = (user: User) => {
    Alert.alert(
      'Remove Invitation',
      `Remove ${user.name}'s invitation to this event?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeInvitedUser(event.id, user.id);
              setIsLoading(false);
              
              Alert.alert(
                'Success',
                `Removed ${user.name}'s invitation`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onUpdate();
                      // Reset caches and reload
                      setInvitedLoaded(false);
                      setFriendsLoaded(false);
                      loadInvitedUsers();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error removing invitation:', error);
              setIsLoading(false);
              Alert.alert('Error', error.message || 'Failed to remove invitation');
            }
          },
        },
      ]
    );
  };

  const renderParticipant = (user: User) => {
    const isOwner = user.id === event.createdBy;
    const isCurrentUser = user.id === currentUserId;

    return (
      <View key={user.id} style={styles.listItem}>
        <Avatar uri={user.avatarUrl} name={user.name} size={45} />
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemName}>{user.name}</Text>
          <Text style={styles.listItemHandle}>@{user.handle}</Text>
          {isOwner && <Text style={styles.ownerBadge}>Organizer</Text>}
        </View>
        {!isOwner && !isCurrentUser && (
          <View style={styles.listItemActions}>
            <TouchableOpacity
              onPress={() => handleTransferOwnership(user)}
              style={styles.actionButton}
              disabled={isLoading}
            >
              <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoveParticipant(user)}
              style={styles.actionButton}
              disabled={isLoading}
            >
              <Ionicons name="close-circle" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFriend = ({ item }: { item: User }) => {
    const isSelected = selectedFriendIds.has(item.id);
    const isAlreadyInvited = (event.invited || []).includes(item.id);

    return (
      <TouchableOpacity
        onPress={() => !isAlreadyInvited && toggleFriendSelection(item.id)}
        style={[
          styles.listItem,
          isSelected && styles.listItemSelected,
          isAlreadyInvited && styles.listItemDisabled,
        ]}
        disabled={isAlreadyInvited}
      >
        <Avatar uri={item.avatarUrl} name={item.name} size={45} />
        <View style={styles.listItemInfo}>
          <Text style={[styles.listItemName, isAlreadyInvited && styles.textDisabled]}>
            {item.name}
          </Text>
          <Text style={[styles.listItemHandle, isAlreadyInvited && styles.textDisabled]}>
            @{item.handle}
          </Text>
          {isAlreadyInvited && <Text style={styles.invitedBadge}>Already Invited</Text>}
        </View>
        {isAlreadyInvited ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        ) : (
          <Ionicons
            name={isSelected ? 'checkbox' : 'square-outline'}
            size={24}
            color={isSelected ? colors.primary : colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderInvitedUser = (user: User) => (
    <View key={user.id} style={styles.listItem}>
      <Avatar uri={user.avatarUrl} name={user.name} size={45} />
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName}>{user.name}</Text>
        <Text style={styles.listItemHandle}>@{user.handle}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveInvited(user)}
        style={styles.actionButton}
        disabled={isLoading}
      >
        <Ionicons name="close-circle" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'participants':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.helperText}>
              Remove participants or transfer event ownership
            </Text>
            {participants.map(renderParticipant)}
          </View>
        );

      case 'invite':
        if (isLoadingFriends) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          );
        }

        if (friends.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No friends available to invite
              </Text>
              <Text style={styles.emptySubtext}>
                All your friends are already participating in this event
              </Text>
            </View>
          );
        }

        // Return FlatList directly without wrapper for invite tab
        return (
          <>
            <Text style={styles.helperTextInline}>
              Select friends to invite to this event
            </Text>
            <FlatList
              data={friends}
              renderItem={renderFriend}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.flatListContent}
            />
            {selectedFriendIds.size > 0 && (
              <View style={[styles.inviteButtonContainer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
                <Button
                  title={`Invite ${selectedFriendIds.size} Friend${
                    selectedFriendIds.size > 1 ? 's' : ''
                  }`}
                  onPress={handleInviteFriends}
                  isLoading={isLoading}
                />
              </View>
            )}
          </>
        );

      case 'invited':
        if (isLoadingInvited) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          );
        }

        if (invitedUsers.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No pending invitations</Text>
            </View>
          );
        }

        return (
          <View style={styles.tabContent}>
            <Text style={styles.helperText}>
              Users who haven't joined yet
            </Text>
            {invitedUsers.map(renderInvitedUser)}
          </View>
        );

      default:
        return null;
    }
  };

  const invitedCount = invitedLoaded
    ? invitedUsers.length
    : event.invited?.length || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Event</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('participants')}
            style={[styles.tab, activeTab === 'participants' && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'participants' && styles.tabTextActive,
              ]}
            >
              Participants ({participants.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('invite')}
            style={[styles.tab, activeTab === 'invite' && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, activeTab === 'invite' && styles.tabTextActive]}
            >
              Invite Friends
            </Text>
          </TouchableOpacity>
          {event.visibility === 'invite' && (
            <TouchableOpacity
              onPress={() => setActiveTab('invited')}
              style={[styles.tab, activeTab === 'invited' && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'invited' && styles.tabTextActive,
                ]}
              >
                Invited ({invitedCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content - Use FlatList directly for invite tab to avoid nesting warning */}
        {activeTab === 'invite' ? (
          <View style={styles.content}>{renderTabContent()}</View>
        ) : (
          <ScrollView style={styles.content}>{renderTabContent()}</ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.lg,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  helperTextInline: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  listItemSelected: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  listItemDisabled: {
    opacity: 0.6,
    backgroundColor: colors.gray200,
  },
  listItemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  listItemName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  listItemHandle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ownerBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 4,
  },
  invitedBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 4,
  },
  textDisabled: {
    color: colors.textTertiary,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.background,
  },
  flatListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  inviteButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
