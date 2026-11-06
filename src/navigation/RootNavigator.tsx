import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { CoursesScreen } from '../screens/CoursesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NoAccessScreen } from '../screens/NoAccessScreen';
import { OfficialDatesScreen } from '../screens/OfficialDatesScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TeachingScreen } from '../screens/TeachingScreen';
import { WorkloadScreen } from '../screens/WorkloadScreen';
import { colors, typography } from '../theme/branding';

const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  tabBarStyle: { backgroundColor: colors.surfaceAlt, borderTopColor: colors.borderSubtle, minHeight: 56 },
  tabBarActiveTintColor: colors.primarySoft,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarLabelStyle: { fontFamily: typography.fontFamily.medium, fontSize: 13 },
  tabBarIconStyle: { display: 'none' as const },
};

/**
 * Not signed in -> Login only. Signed in -> tabs chosen from the role the SERVER reported this session.
 * Choosing tabs by role is a convenience only: every backend call is still authorized by the backend
 * (a wrong or tampered role just produces "forbidden" errors, never data).
 */
export function RootNavigator() {
  const { status, profile } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading" />
      </View>
    );
  }
  if (status === 'signedOut') return <LoginScreen />;

  if (profile?.role === 'professor') {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarAccessibilityLabel: 'Home tab' }} />
        <Tab.Screen name="Teaching" component={TeachingScreen} options={{ tabBarAccessibilityLabel: 'Teaching tab' }} />
        <Tab.Screen name="Workload" component={WorkloadScreen} options={{ tabBarAccessibilityLabel: 'Workload and suggestions tab' }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarAccessibilityLabel: 'Decision history tab' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarAccessibilityLabel: 'Settings tab' }} />
      </Tab.Navigator>
    );
  }

  if (profile?.role === 'student') {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarAccessibilityLabel: 'Home tab' }} />
        <Tab.Screen name="Courses" component={CoursesScreen} options={{ tabBarAccessibilityLabel: 'Courses tab' }} />
        <Tab.Screen name="Register" component={RegisterScreen} options={{ tabBarAccessibilityLabel: 'Assessment register tab' }} />
        <Tab.Screen
          name="OfficialDates"
          component={OfficialDatesScreen}
          options={{ tabBarLabel: 'Official dates', tabBarAccessibilityLabel: 'My official dates tab' }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarAccessibilityLabel: 'Settings tab' }} />
      </Tab.Navigator>
    );
  }

  return <NoAccessScreen />;
}
