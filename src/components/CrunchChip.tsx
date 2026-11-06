import React from 'react';
import { View } from 'react-native';
import type { CrunchLevel } from '../fixtures/c0';
import { colors, radii, spacing, typography } from '../theme/branding';
import { AppText } from './AppText';

const meta: Record<CrunchLevel, { label: string; bg: string }> = {
  low: { label: 'Low', bg: colors.crunchLow },
  medium: { label: 'Medium', bg: colors.crunchMedium },
  high: { label: 'High', bg: colors.crunchHigh },
};

export const crunchLabel = (l: CrunchLevel) => meta[l].label;

/** Color AND text, so crunch level never depends on color alone. */
export function CrunchChip({ level }: { level: CrunchLevel }) {
  return (
    <View
      accessible
      accessibilityLabel={`${meta[level].label} crunch`}
      style={{
        backgroundColor: meta[level].bg,
        borderRadius: radii.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        minHeight: 28,
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <AppText variant="caption" color="#111111" style={{ fontFamily: typography.fontFamily.bold }}>
        {meta[level].label}
      </AppText>
    </View>
  );
}
