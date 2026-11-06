import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { ViewState } from '../data/useData';
import { colors, spacing } from '../theme/branding';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  state: ViewState;
  message?: string;
  emptyText: string;
  onRetry: () => void;
  children: React.ReactNode;
}

/** One place that renders loading / empty / error for every data screen. */
export function StateView({ state, message, emptyText, onRetry, children }: Props) {
  if (state === 'ready') return <>{children}</>;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.lg }}>
      {state === 'loading' && (
        <>
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading" />
          <AppText color={colors.textSecondary} accessibilityLiveRegion="polite">
            Loading...
          </AppText>
        </>
      )}
      {state === 'empty' && (
        <AppText color={colors.textSecondary} style={{ textAlign: 'center' }}>
          {emptyText}
        </AppText>
      )}
      {state === 'error' && (
        <>
          <AppText color={colors.crunchHigh} style={{ textAlign: 'center' }} accessibilityLiveRegion="assertive">
            {message ?? 'Something went wrong.'}
          </AppText>
          <Button label="Try again" variant="outlined" onPress={onRetry} />
        </>
      )}
    </View>
  );
}
