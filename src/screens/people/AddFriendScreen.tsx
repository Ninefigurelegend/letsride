import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PeopleScreenProps } from '@/types/navigation';
import { Input, Button, Card, Avatar } from '@/components/common';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/stores/userStore';
import { sendFriendRequest } from '@/services/social/friendsService';
import { getUserByHandle } from '@/services/firebase/firestore';
import { validateHandleFormat } from '@/utils/validation';
import { colors, typography, spacing } from '@/theme';
import { User } from '@/types/models';

export default function AddFriendScreen({
  navigation,
}: PeopleScreenProps<'AddFriend'>) {
  const currentUser = useUserStore((state) => state.currentUser);

  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchResult, setSearchResult] = useState<User | null>(null);

  const handleSearch = async () => {
    if (!currentUser) return;

    // Validate handle format
    const validation = validateHandleFormat(handle);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid handle');
      setSearchResult(null);
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    try {
      // Search for user
      const user = await getUserByHandle(handle);

      if (!user) {
        setError('User not found');
        return;
      }

      if (user.id === currentUser.id) {
        setError('This is your own handle');
        return;
      }

      setSearchResult(user);
    } catch (err) {
      console.error('Error searching user:', err);
      setError('Failed to search for user');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!currentUser || !searchResult) return;

    setIsSending(true);

    try {
      await sendFriendRequest(currentUser.id, handle);

      Alert.alert(
        'Friend Request Sent',
        `Your friend request to @${handle} has been sent!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      Alert.alert('Error', err.message || 'Failed to send friend request');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={48} color={colors.primary} />
          <Text style={styles.title}>Add a Friend</Text>
          <Text style={styles.subtitle}>
            Search for riders by their unique handle
          </Text>
        </View>

        <Input
          label="Handle"
          value={handle}
          onChangeText={(text) => {
            setHandle(text.toLowerCase());
            setError('');
            setSearchResult(null);
          }}
          placeholder="e.g., johnrider"
          autoCapitalize="none"
          autoCorrect={false}
          leftElement={<Text style={styles.atSymbol}>@</Text>}
          error={error}
          helperText="Enter the exact handle of the person you want to add"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        <Button
          title="Search"
          onPress={handleSearch}
          isLoading={isSearching}
          disabled={handle.length < 3}
          style={styles.searchButton}
        />

        {searchResult && (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Avatar
                uri={searchResult.avatarUrl}
                name={searchResult.name}
                size={60}
              />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{searchResult.name}</Text>
                <Text style={styles.resultHandle}>@{searchResult.handle}</Text>
                {searchResult.bio && (
                  <Text style={styles.resultBio} numberOfLines={2}>
                    {searchResult.bio}
                  </Text>
                )}
              </View>
            </View>

            <Button
              title="Send Friend Request"
              onPress={handleSendRequest}
              isLoading={isSending}
              style={styles.sendButton}
            />
          </Card>
        )}

        {!searchResult && !error && handle.length >= 3 && (
          <View style={styles.helpContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.info}
            />
            <Text style={styles.helpText}>Tap "Search" to find this user</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  atSymbol: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  searchButton: {
    marginTop: spacing.md,
  },
  resultCard: {
    marginTop: spacing.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  resultInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  resultHandle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultBio: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sendButton: {
    width: '100%',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.info + '15',
    borderRadius: 8,
  },
  helpText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.info,
  },
});

