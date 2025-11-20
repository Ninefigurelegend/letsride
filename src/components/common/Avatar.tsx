import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography } from '@/theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

export default function Avatar({
  uri,
  name,
  size = 40,
  showOnlineStatus = false,
  isOnline = false,
  style,
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  const textStyle = {
    fontSize: size * 0.4,
  };

  const statusSize = size * 0.25;
  const statusStyle = {
    width: statusSize,
    height: statusSize,
    borderRadius: statusSize / 2,
    backgroundColor: isOnline ? colors.onlineStatus : colors.offlineStatus,
  };

  return (
    <View style={containerStyle}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Text style={[styles.initials, textStyle]}>{initials}</Text>
      )}
      {showOnlineStatus && (
        <View style={[styles.statusIndicator, statusStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.white,
  },
});

