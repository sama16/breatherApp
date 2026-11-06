import {
  Raleway_300Light,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  useFonts,
} from '@expo-google-fonts/raleway';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GatewayProvider } from './src/api/GatewayContext';
import { AuthProvider } from './src/auth/AuthContext';
import { FixtureProvider } from './src/fixtures/FixtureState';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/branding';

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.surfaceAlt, primary: colors.primary },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Raleway_300Light,
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });
  // If the font fails to load we still start (system font) rather than show a blank screen.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FixtureProvider>
          <GatewayProvider>
            <NavigationContainer theme={navTheme}>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </GatewayProvider>
        </FixtureProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
