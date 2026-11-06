import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRemote } from '../api/useRemote';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RemoteView } from '../components/RemoteView';
import { Screen } from '../components/Screen';
import { USE_FIXTURES } from '../config';
import { coverageText, fmtDate, type ReviewStatus, type SourceKind } from '../domain/c1';
import { FIXTURE_LABEL } from '../fixtures/c0';
import { colors, spacing } from '../theme/branding';

const SOURCE_WORD: Record<SourceKind, string> = {
  canvas_api: 'Canvas',
  syllabus_pdf: 'Syllabus PDF',
  manual: 'Entered manually',
};
const REVIEW_WORD: Record<ReviewStatus, string> = {
  reviewed: 'Reviewed',
  needs_review: 'Needs review',
  draft: 'Draft',
};

/** Professor: courses with source + coverage, and the preparation list. Same data and statuses as the web app. */
export function TeachingScreen() {
  const { state, reload } = useRemote((g) => g.getTeaching());
  const [tab, setTab] = useState<'courses' | 'prep'>('courses');

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
        Teaching
      </AppText>
      {USE_FIXTURES && <Banner tone="warning" text={FIXTURE_LABEL} />}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Button label={tab === 'courses' ? 'Courses (selected)' : 'Courses'} variant={tab === 'courses' ? 'primary' : 'outlined'} onPress={() => setTab('courses')} />
        <Button label={tab === 'prep' ? 'Preparation (selected)' : 'Preparation'} variant={tab === 'prep' ? 'primary' : 'outlined'} onPress={() => setTab('prep')} />
      </View>

      <RemoteView
        state={state}
        onRetry={reload}
        isEmpty={(d) => (tab === 'courses' ? d.courses.length === 0 : d.prep.length === 0)}
        emptyText={tab === 'courses' ? 'No courses yet.' : 'Nothing to prepare yet.'}
      >
        {(d) =>
          tab === 'courses' ? (
            <FlatList
              data={d.courses}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
              renderItem={({ item: c }) => {
                const imported = c.source.importedAt ? `imported ${fmtDate(c.source.importedAt)}` : 'never imported';
                return (
                  <Card
                    accessibilityLabel={`${c.code}, ${c.title}. Source ${SOURCE_WORD[c.source.kind]}, ${imported}. ${coverageText(c.coverage)}. ${REVIEW_WORD[c.review]}.${c.source.stale ? ' Import may be out of date.' : ''}${c.source.incomplete ? ' Import is incomplete.' : ''}`}
                  >
                    <AppText variant="subtitle">{c.code}</AppText>
                    <AppText>{c.title}</AppText>
                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                      Source: {SOURCE_WORD[c.source.kind]} · {imported}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Coverage: {coverageText(c.coverage)}
                    </AppText>
                    <AppText variant="caption" color={colors.primarySoft} style={{ marginTop: spacing.xs }}>
                      {REVIEW_WORD[c.review]}
                    </AppText>
                    {c.source.stale && <Banner tone="warning" text="This import may be out of date. Re-import before relying on it." />}
                    {c.source.incomplete && <Banner tone="warning" text="Import incomplete: some assessments may be missing." />}
                  </Card>
                );
              }}
            />
          ) : (
            <FlatList
              data={d.prep}
              keyExtractor={(p) => p.id}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
              renderItem={({ item: p }) => (
                <Card accessibilityLabel={`${p.title}, ${p.courseCode}. Official date ${fmtDate(p.officialDate)}, read only. ${REVIEW_WORD[p.review]}.`}>
                  <AppText variant="subtitle">{p.title}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {p.courseCode} · Official date {fmtDate(p.officialDate)} (read-only)
                  </AppText>
                  <AppText variant="caption" color={colors.primarySoft}>
                    {REVIEW_WORD[p.review]}
                  </AppText>
                </Card>
              )}
            />
          )
        }
      </RemoteView>
    </Screen>
  );
}
