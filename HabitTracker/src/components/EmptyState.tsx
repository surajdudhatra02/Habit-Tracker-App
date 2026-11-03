import React from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../constants';
import Button from './Button';

const EmptyState = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.container}>
    <View style={styles.illustration}>
      <MaterialDesignIcons
        name="sprout-outline"
        size={44}
        color={colors.light_green}
      />
    </View>
    <Text style={styles.eyebrow}>A FRESH START</Text>
    <Text style={styles.title}>Good things start small.</Text>
    <Text style={styles.description}>
      Pick one habit you want to grow. A little time each day can make a lasting
      difference.
    </Text>
    <Button
      text="Create First Habit"
      className="bg-light_green px-6 py-4 rounded-2xl"
      textClassName="text-black font-bold text-sm"
      icon={<MaterialDesignIcons name="plus" size={18} color={colors.black} />}
      onPress={onPress}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: 16,
  },
  illustration: {
    width: 92,
    height: 92,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.card_border,
    backgroundColor: colors.dark_grey,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  eyebrow: {
    color: colors.light_green,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  description: {
    color: colors.grey_text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 26,
    maxWidth: 290,
  },
});

export default EmptyState;
