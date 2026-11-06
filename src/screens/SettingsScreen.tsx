import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Segmented } from '../components/Segmented';
import { colors, spacing } from '../theme/branding';
import { AboutPanel } from './AboutPanel';
import { DiagnosticsPanel } from './DiagnosticsPanel';

type Seg = 'account' | 'about' | 'diagnostics';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={{ marginBottom: spacing.sm }}>
      <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

/** Settings: Account (profile + log out), About and privacy, Diagnostics (evidence + checklist). */
export function SettingsScreen() {
  const { profile, expiresAt, mode, signOut } = useAuth();
  const [seg, setSeg] = useState<Seg>('account');
  const expiry = expiresAt ? new Date(expiresAt).toLocaleString('en-GB') : 'n/a';
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
        Settings
      </AppText>
      <Segmented
        value={seg}
        onChange={setSeg}
        options={[
          { key: 'account', label: 'Account' },
          { key: 'about', label: 'About' },
          { key: 'diagnostics', label: 'Testing' },
        ]}
      />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md }}>
        {seg === 'account' && (
          <>
            {mode === 'fixture' && <Banner tone="warning" text="FIXTURE MODE: in-memory fake session, nothing stored, no backend contacted." />}
            <Card>
              <Row label="Signed in as" value={profile?.displayName ?? 'unknown'} />
              <Row label="Role (from the server, never stored)" value={profile?.role ?? 'unknown'} />
              <Row label="Session expires" value={expiry} />
            </Card>
            <Button label="Log out" variant="outlined" onPress={() => void signOut()} testID="logout-button" />
          </>
        )}
        {seg === 'about' && <AboutPanel />}
        {seg === 'diagnostics' && <DiagnosticsPanel />}
      </ScrollView>
    </Screen>
  );
}
