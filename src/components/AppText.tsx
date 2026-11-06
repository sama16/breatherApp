import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, typography } from '../theme/branding';

export type TextVariant = 'display' | 'headline' | 'title' | 'subtitle' | 'body' | 'caption';

const variants: Record<TextVariant, TextStyle> = {
  display: { fontFamily: typography.fontFamily.bold, fontSize: typography.size.display },
  headline: { fontFamily: typography.fontFamily.bold, fontSize: typography.size.headline },
  title: { fontFamily: typography.fontFamily.bold, fontSize: typography.size.title },
  subtitle: { fontFamily: typography.fontFamily.medium, fontSize: typography.size.subtitle },
  body: { fontFamily: typography.fontFamily.regular, fontSize: typography.size.bodyLg },
  caption: { fontFamily: typography.fontFamily.regular, fontSize: typography.size.body },
};

interface Props extends TextProps {
  variant?: TextVariant;
  color?: string;
}

/** Text that follows the brand type scale and respects the user's system font scaling. */
export function AppText({ variant = 'body', color = colors.textPrimary, style, ...rest }: Props) {
  return <Text allowFontScaling maxFontSizeMultiplier={2} style={[variants[variant], { color }, style]} {...rest} />;
}
