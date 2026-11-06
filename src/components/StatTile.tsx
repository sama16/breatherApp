import React from 'react';
import { View } from 'react-native';
import { colors, radii, spacing } from '../theme/branding';
import { AppText } from './AppText';

/** Small number-plus-label tile. `value` is text so "Not available" can be shown instead of a fake 0. */
export function StatTile({ value, label, tint = colors.primarySoft }: { value: string; label: string; tint?: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, gap: spacing.xs, minHeight: 84 }}
    >
      <AppText variant="title" color={tint}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}
