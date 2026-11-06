import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import { buildEvidenceText, CHECKLIST, NEXT_RESULT, RESULT_LABEL, type Result } from '../acceptance/checklist';
import { useAuth } from '../auth/AuthContext';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { BACKEND_BASE_URL } from '../config';
import { FIXTURE_VIEW_STATES } from '../fixtures/c0';
import { useFixtureState } from '../fixtures/FixtureState';
import { colors, radii, spacing } from '../theme/branding';

const TINT: Record<Result, string> = {
  not_run: colors.textMuted,
  pass: colors.crunchLow,
  fail: colors.crunchHigh,
  limitation: colors.crunchMedium,
};

function deviceName(): string {
  const c = Platform.constants as unknown as { Brand?: string; Model?: string };
  return [c?.Brand, c?.Model].filter(Boolean).join(' ') || 'unknown (record by hand)';
}

/** Environment + fixture states + the on-device acceptance checklist (human-entered, shareable as text). */
export function DiagnosticsPanel() {
  const { profile, mode } = useAuth();
  const { viewState, setViewState } = useFixtureState();
  const [results, setResults] = useState<Record<string, Result>>({});
  const role = profile?.role ?? 'unknown';
  const items = CHECKLIST.filter((c) => c.roles.includes('both') || c.roles.includes(role as 'student' | 'professor'));

  const ctx = () => ({
    mode,
    backendUrl: BACKEND_BASE_URL,
    appVersion: Constants.expoConfig?.version ?? 'unknown',
    androidApi: String(Platform.Version),
    device: deviceName(),
    role,
    when: new Date().toISOString(),
  });

  return (
    <>
      {mode === 'fixture' && <Banner tone="warning" text="FIXTURE MODE: results recorded here are NOT real-backend evidence." />}
      <Card variant="outlined">
        <AppText variant="subtitle">Environment</AppText>
        {Object.entries({ Mode: mode, Backend: BACKEND_BASE_URL, 'App version': ctx().appVersion, 'Android API': ctx().androidApi, Device: ctx().device }).map(
          ([k, v]) => (
            <View key={k} accessible accessibilityLabel={`${k}: ${v}`} style={{ marginTop: spacing.sm }}>
              <AppText variant="caption" color={colors.textSecondary}>{k}</AppText>
              <AppText>{String(v)}</AppText>
            </View>
          ),
        )}
      </Card>

      <SectionHeader title="Acceptance checklist" />
      <AppText variant="caption" color={colors.textSecondary}>
        Tap an item to cycle: Not run, Pass, Fail, Limitation. Only mark Pass after you really did it on this device.
      </AppText>
      <View style={{ gap: spacing.sm }}>
        {items.map((c) => {
          const r = results[c.id] ?? 'not_run';
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`${c.id}. ${c.text}. Result: ${RESULT_LABEL[r]}. Double tap to change.`}
              onPress={() => setResults((p) => ({ ...p, [c.id]: NEXT_RESULT[r] }))}
              style={{ minHeight: 56, borderRadius: radii.md, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.xs }}
            >
              <AppText variant="caption" color={TINT[r]}>{`${c.id} · ${RESULT_LABEL[r]}`}</AppText>
              <AppText variant="caption">{c.text}</AppText>
            </Pressable>
          );
        })}
      </View>
      <Button
        label="Share evidence text"
        onPress={() => void Share.share({ message: buildEvidenceText(ctx(), results) })}
        testID="share-evidence"
      />

      {mode === 'fixture' && (
        <>
          <SectionHeader title="Fixture screen state" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {FIXTURE_VIEW_STATES.map((s) => (
              <Button key={s} label={s === viewState ? `${s} (selected)` : s} variant={s === viewState ? 'primary' : 'outlined'} onPress={() => setViewState(s)} />
            ))}
          </View>
        </>
      )}
    </>
  );
}
