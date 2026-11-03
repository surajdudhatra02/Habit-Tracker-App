import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants';

const BrandLogo = ({ size = 28 }: { size?: number }) => (
  <Text
    style={[styles.wordmark, { fontSize: size, lineHeight: size * 1.25 }]}
    accessibilityLabel="Habitz"
  >
    Habit<Text style={styles.accent}>z.</Text>
  </Text>
);

const styles = StyleSheet.create({
  wordmark: { color: colors.white, fontWeight: '400', letterSpacing: -1 },
  accent: { color: colors.light_green, fontWeight: '700' },
});

export default BrandLogo;
