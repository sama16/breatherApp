import React from 'react';
import { FlatList, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Card } from '../components/Card';
import { CrunchChip, crunchLabel } from '../components/CrunchChip';
import { Screen } from '../components/Screen';
import { StateView } from '../components/StateView';
import { USE_FIXTURES } from '../config';
import { useAssessments } from '../data/useData';
import { fixtureCourses, FIXTURE_LABEL } from '../fixtures/c0';
import { colors, spacing } from '../theme/branding';

const codeFor = (courseId: string) => fixtureCourses.find((c) => c.id === courseId)?.code ?? courseId;

function prettyDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** The assessment register: every assessment with its OFFICIAL date, read-only. */
export function RegisterScreen() {
  const { state, data, message, retry } = useAssessments();
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.md }}>
        Assessment register
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
        Official dates. Breather never changes them.
      </AppText>
      {USE_FIXTURES && <Banner tone="warning" text={FIXTURE_LABEL} />}
      <StateView state={state} message={message} emptyText="No assessments yet." onRetry={retry}>
        <FlatList
          data={data}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          renderItem={({ item }) => (
            <Card
              accessibilityLabel={`${item.title}, ${codeFor(item.courseId)}, due ${prettyDate(item.officialDate)}, ${item.weightPercent} percent of the grade. ${crunchLabel(item.crunch)} crunch.`}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md }}
            >
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle">{item.title}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {codeFor(item.courseId)} · {prettyDate(item.officialDate)} · {item.weightPercent}%
                </AppText>
              </View>
              <CrunchChip level={item.crunch} />
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}
