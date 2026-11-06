import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { colors, spacing } from '../theme/branding';

/** Shown when the server-reported role is not one the mobile app supports. */
export function NoAccessScreen() {
  const { profile, signOut } = useAuth();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.md }}>
        <AppText variant="title" accessibilityRole="header">
          No mobile access
        </AppText>
        <AppText color={colors.textSecondary}>
          Your account role ({profile?.role ?? 'unknown'}) is not supported in the Breather mobile app. Use the web app, or ask your administrator.
        </AppText>
        <Button label="Log out" variant="outlined" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}
