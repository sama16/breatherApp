import React from 'react';
import { FlatList } from 'react-native';
import { useRemote } from '../api/useRemote';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Card } from '../components/Card';
import { RemoteView } from '../components/RemoteView';
import { Screen } from '../components/Screen';
import { USE_FIXTURES } from '../config';
import { fmtDate, proposalStatusLabel, type DecisionAction } from '../domain/c1';
import { FIXTURE_LABEL } from '../fixtures/c0';
import { colors, spacing } from '../theme/branding';

const ACTION_WORD: Record<DecisionAction, string> = { accept: 'Accepted', reject: 'Rejected', lock: 'Locked' };

/** Decision history from the backend (read-only). */
export function HistoryScreen() {
  const { state, reload } = useRemote((g) => g.getHistory());
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
        Decision history
      </AppText>
      {USE_FIXTURES && <Banner tone="warning" text={FIXTURE_LABEL} />}
      <RemoteView state={state} onRetry={reload} isEmpty={(d) => d.length === 0} emptyText="No decisions yet.">
        {(entries) => (
          <FlatList
            data={entries}
            keyExtractor={(h) => h.id}
            contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
            renderItem={({ item: h }) => (
              <Card accessibilityLabel={`${ACTION_WORD[h.action]} ${h.title} on ${fmtDate(h.at)} by ${h.actorRole}. ${proposalStatusLabel(h.resultStatus)}.`}>
                <AppText variant="subtitle">
                  {ACTION_WORD[h.action]}: {h.title}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {fmtDate(h.at)} · {h.actorRole}
                </AppText>
                <AppText variant="caption" color={colors.primarySoft}>
                  {proposalStatusLabel(h.resultStatus)}
                </AppText>
              </Card>
            )}
          />
        )}
      </RemoteView>
    </Screen>
  );
}
