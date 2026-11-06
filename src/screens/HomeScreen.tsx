import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRemote } from '../api/useRemote';
import { useAuth } from '../auth/AuthContext';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Card } from '../components/Card';
import { HeroCard } from '../components/HeroCard';
import { RemoteView } from '../components/RemoteView';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { StatTile } from '../components/StatTile';
import { USE_FIXTURES } from '../config';
import { crunchWord, fmtDate, formatCount, type OfficialDate, type Proposal, type WorkloadResult } from '../domain/c1';
import { FIXTURE_LABEL } from '../fixtures/c0';
import { brand, colors, spacing } from '../theme/branding';

const firstName = (n?: string) => (n ? n.split(' ')[0] : 'there');

/** The busiest week, or null when there is no usable result. Never invents a week. */
function busiestWeek(r: WorkloadResult) {
  if (r.status !== 'ok' || r.weeks.length === 0) return null;
  const rank = { low: 0, medium: 1, high: 2 } as const;
  return [...r.weeks].sort((a, b) => rank[b.crunch] - rank[a.crunch])[0];
}

function ProfessorHome() {
  const workload = useRemote((g) => g.getWorkload());
  const proposals = useRemote((g) => g.getProposals());
  const pending = proposals.state.status === 'ready' ? proposals.state.data.filter((p: Proposal) => p.status === 'pending').length : null;
  const worst = workload.state.status === 'ready' ? busiestWeek(workload.state.data) : null;
  return (
    <>
      <HeroCard
        eyebrow="Your teaching overview"
        title={pending === null ? '...' : `${pending} suggestion${pending === 1 ? '' : 's'} waiting`}
        subtitle="Review them in the Workload tab. Approving never changes Canvas."
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <StatTile value={pending === null ? 'Not available' : String(pending)} label="Pending" />
        <StatTile
          value={worst ? crunchWord(worst.crunch) : 'No data'}
          label={worst ? `Busiest week ${fmtDate(worst.weekStart)}` : 'Busiest week'}
          tint={worst?.crunch === 'high' ? colors.crunchHigh : worst?.crunch === 'medium' ? colors.crunchMedium : colors.crunchLow}
        />
      </View>
      <SectionHeader title="Workload status" />
      <RemoteView state={workload.state} onRetry={workload.reload}>
        {(r) => (
          <Card>
            <AppText>
              {r.status === 'ok'
                ? `Latest result covers ${r.weeks.length} weeks (computed ${fmtDate(r.computedAt)}).`
                : r.status === 'suppressed'
                  ? 'Hidden for privacy: too few students.'
                  : r.status === 'timeout'
                    ? 'The last calculation timed out.'
                    : `No result: ${r.reason}`}
            </AppText>
          </Card>
        )}
      </RemoteView>
    </>
  );
}

function StudentHome() {
  const dates = useRemote((g) => g.getOfficialDates());
  return (
    <RemoteView state={dates.state} onRetry={dates.reload} isEmpty={(d) => d.length === 0} emptyText="No official dates yet.">
      {(list: OfficialDate[]) => {
        const sorted = [...list].sort((a, b) => a.officialDate.localeCompare(b.officialDate));
        const next = sorted[0];
        const changed = list.filter((d) => d.officialDate !== d.importedOfficialDate).length;
        return (
          <>
            <HeroCard
              eyebrow="Next assessment"
              title={next ? next.title : 'Nothing due'}
              subtitle={next ? `${next.courseCode} · ${fmtDate(next.officialDate)} (official date from Canvas)` : undefined}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <StatTile value={formatCount(list.length)} label="Assessments" />
              <StatTile value={String(changed)} label="Differ from import" tint={changed ? colors.crunchMedium : colors.crunchLow} />
            </View>
            <SectionHeader title="Coming up" />
            <View style={{ gap: spacing.sm }}>
              {sorted.slice(0, 3).map((d) => (
                <Card key={d.assessmentId} accessibilityLabel={`${d.title}, ${d.courseCode}, ${fmtDate(d.officialDate)}`}>
                  <AppText variant="subtitle">{d.title}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {d.courseCode} · {fmtDate(d.officialDate)}
                  </AppText>
                </Card>
              ))}
            </View>
          </>
        );
      }}
    </RemoteView>
  );
}

/** First tab for both roles: a calm summary of what matters now. */
export function HomeScreen() {
  const { profile } = useAuth();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <AppText variant="caption" color={colors.primarySoft} style={{ marginTop: spacing.md }}>
          {brand.name}
        </AppText>
        <AppText variant="title" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          Hi {firstName(profile?.displayName)}
        </AppText>
        {USE_FIXTURES && <Banner tone="warning" text={FIXTURE_LABEL} />}
        {profile?.role === 'professor' ? <ProfessorHome /> : <StudentHome />}
        <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xl, textAlign: 'center' }}>
          {brand.slogan}
        </AppText>
      </ScrollView>
    </Screen>
  );
}
