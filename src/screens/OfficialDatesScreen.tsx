import React from 'react';
import { FlatList } from 'react-native';
import { useRemote } from '../api/useRemote';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Card } from '../components/Card';
import { RemoteView } from '../components/RemoteView';
import { Screen } from '../components/Screen';
import { USE_FIXTURES } from '../config';
import { fmtDate } from '../domain/c1';
import { FIXTURE_LABEL } from '../fixtures/c0';
import { colors, spacing } from '../theme/branding';

/**
 * Student: my OWN official dates (the backend scopes this to the signed-in owner; a 403 shows a permission message).
 * Dates are read-only. A local approval in the staff workflow never changes what is shown here.
 */
export function OfficialDatesScreen() {
  const { state, reload } = useRemote((g) => g.getOfficialDates());
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.md }}>
        My official dates
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
        These dates come from Canvas. Breather never changes them.
      </AppText>
      {USE_FIXTURES && <Banner tone="warning" text={FIXTURE_LABEL} />}
      <RemoteView state={state} onRetry={reload} isEmpty={(d) => d.length === 0} emptyText="No official dates yet.">
        {(dates) => (
          <>
            {dates.some((d) => d.source.stale) && (
              <Banner tone="warning" text="Some dates may be out of date. Check Canvas for the latest." />
            )}
            {dates.some((d) => d.source.incomplete) && (
              <Banner tone="warning" text="Some dates may be missing because the import is incomplete." />
            )}
            <FlatList
              data={dates}
              keyExtractor={(d) => d.assessmentId}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
              renderItem={({ item: d }) => {
                const differs = d.officialDate !== d.importedOfficialDate;
                return (
                  <Card
                    accessibilityLabel={`${d.title}, ${d.courseCode}. Official date ${fmtDate(d.officialDate)}.${differs ? ` Differs from the first import, which was ${fmtDate(d.importedOfficialDate)}. Check Canvas.` : ' Unchanged since import.'}`}
                  >
                    <AppText variant="subtitle">{d.title}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {d.courseCode} · Official date {fmtDate(d.officialDate)}
                    </AppText>
                    <AppText variant="caption" color={differs ? colors.crunchMedium : colors.crunchLow}>
                      {differs ? `Differs from first import (${fmtDate(d.importedOfficialDate)}). Check Canvas.` : 'Unchanged since import'}
                    </AppText>
                  </Card>
                );
              }}
            />
          </>
        )}
      </RemoteView>
    </Screen>
  );
}
