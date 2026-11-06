import React from 'react';
import { View } from 'react-native';
import { colors, radii, spacing } from '../theme/branding';
import { AppText } from './AppText';

/** Visible label so fixture/placeholder content is never mistaken for real backend data. */
export function Banner({ text, tone = 'info' }: { text: string; tone?: 'info' | 'warning' }) {
  const c = tone === 'warning' ? colors.crunchMedium : colors.primarySoft;
  return (
    <View
      accessible
      accessibilityRole="alert"
      style={{ borderColor: c, borderWidth: 1, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.md }}
    >
      <AppText variant="caption" color={c}>
        {text}
      </AppText>
    </View>
  );
}
