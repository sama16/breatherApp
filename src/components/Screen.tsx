import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradients, spacing } from '../theme/branding';

/** Dark gradient screen with safe-area padding. */
export function Screen({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  return (
    <LinearGradient colors={[...gradients.background]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <View style={[styles.fill, padded && { paddingHorizontal: spacing.lg }]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
