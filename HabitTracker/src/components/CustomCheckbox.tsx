import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';

interface CustomCheckboxProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}

const CustomCheckbox = ({
  checked,
  onValueChange,
  accessibilityLabel = 'Complete habit',
}: CustomCheckboxProps) => {
  const reducedMotion = useReducedMotion();
  const previousChecked = useRef(checked);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion !== false) {
      scale.stopAnimation();
      scale.setValue(1);
    } else if (previousChecked.current !== checked) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: checked ? 1.12 : 0.94,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 12,
          stiffness: 260,
          mass: 0.6,
          useNativeDriver: true,
        }),
      ]).start();
    }
    previousChecked.current = checked;
    return () => scale.stopAnimation();
  }, [checked, reducedMotion, scale]);

  return (
    <TouchableOpacity
      onPress={() => onValueChange(!checked)}
      style={styles.touchTarget}
      activeOpacity={0.72}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
    >
      <Animated.View
        style={[
          styles.circle,
          checked && styles.checked,
          { transform: [{ scale }] },
        ]}
      >
        {checked && (
          <MaterialDesignIcons name="check" size={19} color={colors.dark_bg} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchTarget: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.divider_grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.light_green,
    borderColor: colors.light_green,
  },
});

export default CustomCheckbox;
