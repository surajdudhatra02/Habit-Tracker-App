import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants';

const BrandLogo = ({ size = 28 }: { size?: number }) => (
  <View
    style={styles.container}
    accessible
    accessibilityRole="image"
    accessibilityLabel="Habitz"
  >
    <Image
      source={require('../assets/habitz-icon.png')}
      style={[
        styles.icon,
        { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.4 },
      ]}
      accessible={false}
    />
    <Text
      style={[styles.wordmark, { fontSize: size, lineHeight: size * 1.25 }]}
      accessible={false}
    >
      Habitz
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    resizeMode: 'contain',
  },
  wordmark: {
    color: colors.white,
    fontWeight: '600',
    letterSpacing: -0.7,
  },
});

export default BrandLogo;
