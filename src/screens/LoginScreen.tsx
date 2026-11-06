import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { brand, colors, spacing } from '../theme/branding';

export function LoginScreen() {
  const { signIn, busy, notice, mode } = useAuth();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="display" accessibilityRole="header">
            {brand.name}
          </AppText>
          <AppText variant="subtitle" color={colors.primarySoft}>
            {brand.tagline}
          </AppText>
        </View>

        {mode === 'fixture' && (
          <Banner tone="warning" text="FIXTURE MODE: this is not a real login. No backend is contacted." />
        )}
        {notice && <Banner text={notice} />}

        {mode === 'fixture' ? (
          <View style={{ gap: spacing.md }}>
            <Button
              label="Continue as student (fixture)"
              onPress={() => void signIn({ fixtureRole: 'student' })}
              loading={busy}
              testID="login-student"
            />
            <Button
              label="Continue as professor (fixture)"
              variant="outlined"
              onPress={() => void signIn({ fixtureRole: 'professor' })}
              disabled={busy}
              testID="login-professor"
            />
          </View>
        ) : (
          <Button
            label="Continue with Canvas"
            accessibilityHint="Opens the secure sign-in page in your browser"
            onPress={() => void signIn()}
            loading={busy}
            testID="login-button"
          />
        )}
        <AppText variant="caption" color={colors.textMuted} style={{ textAlign: 'center' }}>
          Breather never stores your Canvas password.
        </AppText>
      </View>
    </Screen>
  );
}
