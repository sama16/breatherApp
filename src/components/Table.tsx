import React from 'react';
import { View } from 'react-native';
import { colors, spacing } from '../theme/branding';
import { AppText } from './AppText';

interface Column {
  title: string;
  flex?: number;
}

/**
 * Simple accessible table. Each row is read as ONE sentence ("Week 16 Nov, Crunch High, ...")
 * so TalkBack users get the same information as the visual layout.
 */
export function Table({ columns, rows }: { columns: Column[]; rows: string[][] }) {
  return (
    <View accessibilityRole="list">
      <View style={{ flexDirection: 'row', paddingBottom: spacing.xs }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {columns.map((c) => (
          <AppText key={c.title} variant="caption" color={colors.textSecondary} style={{ flex: c.flex ?? 1 }}>
            {c.title}
          </AppText>
        ))}
      </View>
      {rows.map((row, r) => (
        <View
          key={r}
          accessible
          accessibilityLabel={columns.map((c, i) => `${c.title} ${row[i] ?? ''}`).join(', ')}
          style={{ flexDirection: 'row', paddingVertical: spacing.xs, borderTopColor: colors.borderSubtle, borderTopWidth: 1, gap: spacing.xs }}
        >
          {columns.map((c, i) => (
            <AppText key={c.title} variant="caption" style={{ flex: c.flex ?? 1 }}>
              {row[i] ?? ''}
            </AppText>
          ))}
        </View>
      ))}
    </View>
  );
}
