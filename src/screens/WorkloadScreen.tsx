import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRemote } from '../api/useRemote';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import type { Notice } from '../components/DecisionPanel';
import { ProposalCard } from '../components/ProposalCard';
import { RemoteView } from '../components/RemoteView';
import { Screen } from '../components/Screen';
import { Table } from '../components/Table';
import { USE_FIXTURES } from '../config';
import {
  crunchWord,
  fmtDate,
  formatCount,
  formatExposure,
  workloadToText,
  type WorkloadResult,
  type WorkloadWeek,
} from '../domain/c1';
import { FIXTURE_LABEL } from '../fixtures/c0';
import { colors, radii, spacing } from '../theme/branding';

const BAR = { low: 0.34, medium: 0.67, high: 1 } as const;
const BAR_COLOR = { low: colors.crunchLow, medium: colors.crunchMedium, high: colors.crunchHigh } as const;

/** Visual bars. Hidden from screen readers because the text and the table below say the same thing. */
function Bars({ weeks }: { weeks: WorkloadWeek[] }) {
  return (
    <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ gap: spacing.xs }}>
      {weeks.map((w) => (
        <View key={w.weekStart} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="caption" color={colors.textSecondary} style={{ width: 56 }}>
            {fmtDate(w.weekStart)}
          </AppText>
          <View style={{ flex: 1, height: 14, backgroundColor: '#3A3A3A', borderRadius: radii.pill }}>
            <View style={{ width: `${BAR[w.crunch] * 100}%`, height: 14, borderRadius: radii.pill, backgroundColor: BAR_COLOR[w.crunch] }} />
          </View>
        </View>
      ))}
    </View>
  );
}

function WorkloadBody({ result, onRetry }: { result: WorkloadResult; onRetry: () => void }) {
  if (result.status === 'ok') {
    return (
      <Card style={{ gap: spacing.sm }}>
        <AppText variant="caption" color={colors.textMuted}>
          Computed {fmtDate(result.computedAt)} · input {result.inputVersion || 'unknown'}
        </AppText>
        <Bars weeks={result.weeks} />
        <AppText variant="subtitle" accessibilityRole="header">
          In words
        </AppText>
        <AppText variant="caption">{workloadToText(result.weeks)}</AppText>
        <AppText variant="subtitle" accessibilityRole="header">
          Table
        </AppText>
        <Table
          columns={[
            { title: 'Week', flex: 1 },
            { title: 'Crunch', flex: 1 },
            { title: 'Assessments', flex: 1.2 },
            { title: 'Affected', flex: 1.6 },
          ]}
          rows={result.weeks.map((w) => [fmtDate(w.weekStart), crunchWord(w.crunch), formatCount(w.assessmentCount), formatExposure(w.affected)])}
        />
      </Card>
    );
  }
  if (result.status === 'timeout') {
    return (
      <Card style={{ gap: spacing.sm }}>
        <AppText accessibilityLiveRegion="polite">The workload calculation took too long. Nothing was changed.</AppText>
        <Button label="Try again" variant="outlined" onPress={onRetry} />
      </Card>
    );
  }
  if (result.status === 'suppressed') {
    return (
      <Card>
        <AppText>Not shown: too few students to show this safely. This protects student privacy.</AppText>
      </Card>
    );
  }
  return (
    <Card>
      <AppText>No result: {result.reason}</AppText>
    </Card>
  );
}

/** Professor: workload (visual + words + table), suggestions, same-input comparison, and decisions. */
export function WorkloadScreen() {
  const workload = useRemote((g) => g.getWorkload());
  const proposals = useRemote((g) => g.getProposals());
  const [notice, setNotice] = useState<Notice | null>(null);

  const reloadAll = () => {
    workload.reload();
    proposals.reload();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}>
        <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.md }}>
          Workload
        </AppText>
        {USE_FIXTURES && <Banner tone="warning" text={FIXTURE_LABEL} />}
        {notice && <Banner tone={notice.tone} text={notice.text} />}

        <RemoteView state={workload.state} onRetry={workload.reload}>
          {(result) => <WorkloadBody result={result} onRetry={workload.reload} />}
        </RemoteView>

        <AppText variant="title" accessibilityRole="header">
          Suggestions
        </AppText>
        <RemoteView state={proposals.state} onRetry={proposals.reload} isEmpty={(d) => d.length === 0} emptyText="No suggestions right now.">
          {(list) => (
            <View style={{ gap: spacing.md }}>
              {list.map((p) => (
                <ProposalCard key={p.id} proposal={p} onNotice={setNotice} onChanged={reloadAll} />
              ))}
            </View>
          )}
        </RemoteView>
      </ScrollView>
    </Screen>
  );
}
