import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  GestureResponderEvent,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cssInterop } from 'nativewind';
import { colors } from '../constants';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
cssInterop(AnimatedTouchableOpacity, { className: 'style' });

export interface ButtonProps {
  text: string;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingColor?: string;
  accessibilityLabel?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  text,
  className = '',
  textClassName = '',
  icon,
  onPress,
  disabled = false,
  loading = false,
  loadingColor = colors.white,
  accessibilityLabel,
  children,
}) => {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion !== false) {
      scale.stopAnimation();
      scale.setValue(1);
    }
    return () => scale.stopAnimation();
  }, [reducedMotion, scale]);

  return (
    <AnimatedTouchableOpacity
      className={className}
      onPress={onPress}
      onPressIn={() => {
        if (reducedMotion !== false) return;
        Animated.timing(scale, {
          toValue: 0.975,
          duration: 110,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        if (reducedMotion !== false) return;
        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 280,
          mass: 0.6,
          useNativeDriver: true,
        }).start();
      }}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || text}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      activeOpacity={0.78}
      style={[
        { transform: [{ scale }] },
        (disabled || loading) && styles.disabled,
      ]}
    >
      {children ? (
        children
      ) : (
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator size="small" color={loadingColor} />
          ) : (
            <>
              {icon && <View className="mr-2">{icon}</View>}
              <Text
                className={textClassName || 'text-white text-sm font-semibold'}
              >
                {text}
              </Text>
            </>
          )}
        </View>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: { opacity: 0.5 },
});

export default Button;
