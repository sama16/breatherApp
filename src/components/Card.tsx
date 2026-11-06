import React from 'react';
import { View, type ViewProps } from 'react-native';
import { components } from '../theme/branding';

type Variant = 'default' | 'highlighted' | 'outlined';

const styleFor = {
  default: components.card,
  highlighted: components.cardHighlighted,
  outlined: components.cardOutlined,
} as const;

/** Rounded brand card. Pass accessibilityLabel to read the whole card as one item. */
export function Card({ variant = 'default', style, children, accessibilityLabel, ...rest }: ViewProps & { variant?: Variant }) {
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      style={[styleFor[variant], style]}
      {...rest}
    >
      {children}
    </View>
  );
}
