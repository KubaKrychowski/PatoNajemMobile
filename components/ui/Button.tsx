import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, FontSize, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? Colors.bg : Colors.blue} size="small" />
        : <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primary: { backgroundColor: Colors.green },
  secondary: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  danger: { backgroundColor: 'rgba(255,71,87,0.12)', borderWidth: 1, borderColor: 'rgba(255,71,87,0.3)' },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  disabled: { opacity: 0.5 },
  text: { fontSize: FontSize.md, fontWeight: '600' },
  primaryText: { color: Colors.bg },
  secondaryText: { color: Colors.text },
  dangerText: { color: Colors.error },
  ghostText: { color: Colors.muted },
});
