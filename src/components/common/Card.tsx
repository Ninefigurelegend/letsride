import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: keyof typeof spacing;
}

export default function Card({ 
  children, 
  style, 
  elevated = true,
  padding = 'md',
}: CardProps) {
  const cardStyle = [
    styles.card,
    elevated && shadows.md,
    { padding: spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

