import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/branding';
import { AppText } from './AppText';

/** Android accessibility guideline: touch targets at least 48dp. */
export const MIN_TOUCH_TARGET = 48;

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outlined';
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, accessibilityHint, testID }: Props) {
  const inactive = !!disabled || !!loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.outlined,
        pressed && { opacity: 0.8 },
        inactive && { opacity: 0.5 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <AppText variant="subtitle" color={colors.textPrimary} style={{ textAlign: 'center' }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  primary: { backgroundColor: colors.primary, borderRadius: radii.pill },
  outlined: { borderColor: colors.border, borderWidth: 1, borderRadius: radii.pill },
});
