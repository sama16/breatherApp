import React from 'react';
import { FlatList, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Card } from '../components/Card';
import { CrunchChip, crunchLabel } from '../components/CrunchChip';
import { Screen } from '../components/Screen';
import { StateView } from '../components/StateView';
import { USE_FIXTURES } from '../config';
import { useCourses } from '../data/useData';
import { FIXTURE_LABEL } from '../fixtures/c0';
import { colors, spacing } from '../theme/branding';

export function CoursesScreen() {
  const { state, data, message, retry } = useCourses();
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
        My courses
      </AppText>
      {USE_FIXTURES && <Banner tone="warning" text={FIXTURE_LABEL} />}
      <StateView state={state} message={message} emptyText="No courses yet." onRetry={retry}>
        <FlatList
          data={data}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
          renderItem={({ item, index }) => (
            <Card
              variant={index === 0 ? 'highlighted' : 'default'}
              accessibilityLabel={`${item.code}, ${item.title}, ${item.department}. ${crunchLabel(item.crunch)} crunch. ${item.assessmentCount} assessments.`}
            >
              <AppText variant="subtitle">{item.code}</AppText>
              <AppText>{item.title}</AppText>
              <AppText variant="caption" color={index === 0 ? colors.textPrimary : colors.textSecondary}>
                {item.department} · {item.assessmentCount} assessments
              </AppText>
              <View style={{ marginTop: spacing.sm }}>
                <CrunchChip level={item.crunch} />
              </View>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}
