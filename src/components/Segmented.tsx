import React from 'react';
import { Pressable, View } from 'react-native';
import { colors, radii, spacing } from '../theme/branding';
import { AppText } from './AppText';

/** Tab-like switch inside a page. 48dp tall, selected state announced. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radii.pill, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const sel = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityLabel={o.label}
            accessibilityState={{ selected: sel }}
            onPress={() => onChange(o.key)}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: radii.pill,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: spacing.sm,
              backgroundColor: sel ? colors.primary : 'transparent',
            }}
          >
            <AppText variant="caption" style={{ textAlign: 'center' }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
