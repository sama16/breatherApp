import React from 'react';
import { AppText } from './AppText';
import { spacing } from '../theme/branding';

export function SectionHeader({ title }: { title: string }) {
  return (
    <AppText variant="subtitle" accessibilityRole="header" style={{ marginTop: spacing.md }}>
      {title}
    </AppText>
  );
}
