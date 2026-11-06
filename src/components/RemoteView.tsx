import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Remote } from '../api/useRemote';
import { FAILURE_MESSAGES, isRetryable } from '../domain/failures';
import { colors, spacing } from '../theme/branding';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props<T> {
  state: Remote<T>;
  onRetry: () => void;
  emptyText?: string;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

/** Loading / failed / empty / ready. A failure never renders the children, so it can never look like success. */
export function RemoteView<T>({ state, onRetry, emptyText, isEmpty, children }: Props<T>) {
  if (state.status === 'ready') {
    if (isEmpty?.(state.data)) return <Centered><AppText color={colors.textSecondary} style={{ textAlign: 'center' }}>{emptyText ?? 'Nothing here yet.'}</AppText></Centered>;
    return <>{children(state.data)}</>;
  }
  if (state.status === 'loading') {
    return (
      <Centered>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading" />
        <AppText color={colors.textSecondary} accessibilityLiveRegion="polite">
          Loading...
        </AppText>
      </Centered>
    );
  }
  return (
    <Centered>
      <AppText color={colors.crunchHigh} style={{ textAlign: 'center' }} accessibilityLiveRegion="assertive">
        {FAILURE_MESSAGES[state.kind]}
      </AppText>
      {isRetryable(state.kind) && <Button label="Try again" variant="outlined" onPress={onRetry} />}
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, minHeight: 140, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.lg }}>
      {children}
    </View>
  );
}
