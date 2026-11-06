import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import { colors, gradients, radii, shadows, spacing } from '../theme/branding';
import { AppText } from './AppText';

/** Big purple gradient card at the top of a home page. Read as one sentence by TalkBack. */
export function HeroCard({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <LinearGradient
      colors={[...gradients.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radii.lg, padding: spacing.lg }, shadows.glow]}
    >
      <View accessible accessibilityLabel={`${eyebrow}. ${title}. ${subtitle ?? ''}`} style={{ gap: spacing.xs }}>
        <AppText variant="caption" color={colors.primarySoft}>
          {eyebrow}
        </AppText>
        <AppText variant="headline">{title}</AppText>
        {subtitle ? <AppText color={colors.textPrimary}>{subtitle}</AppText> : null}
      </View>
    </LinearGradient>
  );
}
