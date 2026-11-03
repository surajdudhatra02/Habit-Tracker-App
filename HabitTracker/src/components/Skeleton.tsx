import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  DimensionValue,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SkeletonBlockProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

interface ShimmerState {
  progress: Animated.Value;
  enabled: boolean;
}

const ShimmerContext = createContext<ShimmerState | null>(null);

/** A group shares one native animation, even when it contains many placeholders. */
const ShimmerProvider = ({ children }: { children: React.ReactNode }) => {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const enabled = reducedMotion === false;

  useEffect(() => {
    progress.setValue(0);
    if (!enabled) return;
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1450,
        delay: 250,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
      progress.stopAnimation();
    };
  }, [enabled, progress]);

  return (
    <ShimmerContext.Provider value={{ progress, enabled }}>
      {children}
    </ShimmerContext.Provider>
  );
};

const SkeletonSurface = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonBlockProps) => {
  const shimmer = useContext(ShimmerContext)!;
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setMeasuredWidth(previous =>
      previous === nextWidth ? previous : nextWidth,
    );
  };

  return (
    <View
      onLayout={onLayout}
      style={[styles.block, { width, height, borderRadius }, style]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      {shimmer.enabled && measuredWidth > 0 && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              width: measuredWidth * 0.75,
              transform: [
                {
                  translateX: shimmer.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-measuredWidth, measuredWidth * 1.3],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              `${colors.white}00`,
              `${colors.white}18`,
              `${colors.white}00`,
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>
      )}
    </View>
  );
};

/** Decorative placeholder; loading announcements belong on the surrounding group. */
export const SkeletonBlock = (props: SkeletonBlockProps) => {
  const shimmer = useContext(ShimmerContext);
  return shimmer ? (
    <SkeletonSurface {...props} />
  ) : (
    <ShimmerProvider>
      <SkeletonSurface {...props} />
    </ShimmerProvider>
  );
};

const LoadingGroup = ({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <ShimmerProvider>
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={style}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {children}
      </View>
    </View>
  </ShimmerProvider>
);

export const HabitListSkeleton = ({ count = 3 }: { count?: number }) => (
  <LoadingGroup label="Loading habits">
    <View style={styles.habitList}>
      {Array.from(
        { length: Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 3 },
        (_, index) => (
          <View key={index} style={styles.habitCard}>
            <SkeletonBlock width={46} height={46} borderRadius={15} />
            <View style={styles.habitCopy}>
              <SkeletonBlock width="72%" height={16} />
              <SkeletonBlock width="91%" height={12} />
              <SkeletonBlock width="43%" height={10} />
            </View>
            <SkeletonBlock width={29} height={29} borderRadius={15} />
          </View>
        ),
      )}
    </View>
  </LoadingGroup>
);

/** Matches the seven-day chart's plot and date-label area, without invented values. */
export const WeeklyChartSkeleton = () => (
  <LoadingGroup label="Loading progress">
    <View style={styles.weeklyChart}>
      {Array.from({ length: 7 }, (_, index) => (
        <View key={index} style={styles.weeklyColumn}>
          <SkeletonBlock
            width="100%"
            height={74}
            borderRadius={7}
            style={styles.weeklyBar}
          />
          <SkeletonBlock width={10} height={10} borderRadius={3} />
          <SkeletonBlock width={3} height={3} borderRadius={2} />
        </View>
      ))}
    </View>
  </LoadingGroup>
);

/** Matches the trend card's summary, plot, and date labels. */
export const TrendChartSkeleton = () => (
  <LoadingGroup label="Loading progress">
    <View style={styles.trendSummary}>
      <View style={styles.trendMetric}>
        <SkeletonBlock width={96} height={12} />
        <SkeletonBlock width={75} height={32} />
      </View>
      <SkeletonBlock width={62} height={30} borderRadius={15} />
    </View>
    <SkeletonBlock height={140} borderRadius={12} />
    <View style={styles.trendLabels}>
      <SkeletonBlock width={32} height={8} borderRadius={3} />
      <SkeletonBlock width={32} height={8} borderRadius={3} />
      <SkeletonBlock width={32} height={8} borderRadius={3} />
    </View>
  </LoadingGroup>
);

const styles = StyleSheet.create({
  block: { backgroundColor: colors.card_border, overflow: 'hidden' },
  shimmer: { position: 'absolute', top: 0, bottom: 0, left: 0, opacity: 0.65 },
  gradient: { flex: 1 },
  habitList: { gap: 12 },
  habitCard: {
    backgroundColor: colors.dark_grey,
    borderWidth: 1,
    borderColor: colors.card_border,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitCopy: { flex: 1, gap: 9, paddingVertical: 4 },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  weeklyColumn: { flex: 1, alignItems: 'center', gap: 9 },
  weeklyBar: { maxWidth: 26 },
  trendSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  trendMetric: { gap: 8 },
  trendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 4,
  },
});
