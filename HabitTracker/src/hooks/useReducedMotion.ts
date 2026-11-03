import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Undefined while the system preference is loading; callers should wait. */
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState<boolean>();
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (active) setReducedMotion(value);
      })
      .catch(() => {
        if (active) setReducedMotion(true);
      });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reducedMotion;
};
