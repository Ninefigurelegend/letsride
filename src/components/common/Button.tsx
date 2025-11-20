import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? colors.white : colors.primary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  text_primary: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.white,
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.primary,
  },
  textSize_sm: {
    fontSize: typography.fontSize.sm,
  },
  textSize_md: {
    fontSize: typography.fontSize.base,
  },
  textSize_lg: {
    fontSize: typography.fontSize.lg,
  },
});

