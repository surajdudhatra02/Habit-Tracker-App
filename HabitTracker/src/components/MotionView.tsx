import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewProps } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cssInterop } from 'nativewind';

cssInterop(Animated.View, { className: 'style' });

interface Props extends ViewProps {
  delay?: number;
}

/** A short entrance, with the system's Reduce Motion preference respected. */
const MotionView = ({ delay = 0, children, style, ...props }: Props) => {
  const reducedMotion = useReducedMotion();
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion === undefined) return;
    if (reducedMotion) {
      entrance.setValue(1);
      return;
    }
    const animation = Animated.timing(entrance, {
      toValue: 1,
      delay,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, entrance, reducedMotion]);
  return (
    <Animated.View
      {...props}
      style={[
        style,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default MotionView;
