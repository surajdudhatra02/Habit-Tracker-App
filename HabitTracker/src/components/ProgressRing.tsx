import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../constants';
import { useReducedMotion } from '../hooks/useReducedMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  progress: number;
  size?: number;
  color?: string;
  trackColor?: string;
  textColor?: string;
}

const ProgressRing = ({
  progress,
  size = 96,
  color = colors.dark_bg,
  trackColor = '#8AAB8C',
  textColor = colors.dark_bg,
}: Props) => {
  const value = Math.min(100, Math.max(0, progress));
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const reducedMotion = useReducedMotion();
  const animatedProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion === undefined) return;
    if (reducedMotion) {
      animatedProgress.setValue(value);
      return;
    }
    const animation = Animated.timing(animatedProgress, {
      toValue: value,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [animatedProgress, reducedMotion, value]);

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Today's completion"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={7}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={7}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animatedProgress.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, 0],
          })}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
          fill="none"
        />
      </Svg>
      <View style={styles.label}>
        <Text style={[styles.value, { color: textColor }]}>
          {Math.round(value)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 22, fontWeight: '700', letterSpacing: -0.8 },
});

export default ProgressRing;
