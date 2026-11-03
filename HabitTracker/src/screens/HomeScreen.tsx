import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList, RootStackParamList } from '../navigation';
import { Routes } from '../navigation/route';
import { colors } from '../constants';
import { useHabitCompletionRange, useAuth } from '../hooks';
import { getDateRange, getHabitIcon } from '../utils';
import { getLocalDateString } from '../utils/dateUtils';
import { useHabitStore } from '../store';
import { useToday } from '../hooks/useToday';
import { showErrorToast } from '../utils/toast';
import MotionView from '../components/MotionView';
import ProgressRing from '../components/ProgressRing';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import {
  HabitListSkeleton,
  SkeletonBlock,
  WeeklyChartSkeleton,
} from '../components/Skeleton';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there';
  const habits = useHabitStore(s => s.habits);
  const fetchHabits = useHabitStore(s => s.fetchHabits);
  const getTodayCompletions = useHabitStore(s => s.getTodayCompletions);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const today = useToday();
  const { startDate, endDate } = useMemo(() => getDateRange(6, today), [today]);
  const { data, averageRate, loading, refetch } = useHabitCompletionRange({
    startDate,
    endDate,
    autoFetch: false,
  });

  const loadData = useCallback(async () => {
    try {
      const [, completions] = await Promise.all([
        fetchHabits(),
        getTodayCompletions(),
        refetch(),
      ]);
      setCompletedIds(new Set(completions.map(item => item.habit_id)));
    } catch (error) {
      console.error('Failed to load home screen data:', error);
      showErrorToast('Unable to load habits', 'Please try again.');
    } finally {
      setHasLoaded(true);
    }
  }, [fetchHabits, getTodayCompletions, refetch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };
  const completed = habits.filter(habit => completedIds.has(habit.id)).length;
  const progress = habits.length ? (completed / habits.length) * 100 : 0;
  const allDone = habits.length > 0 && completed === habits.length;
  const showHabitSkeleton = !hasLoaded && habits.length === 0;
  const showProgressSkeleton = loading && data.length === 0;
  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - 6 + index);
        return { date, key: getLocalDateString(date) };
      }),
    [today],
  );

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.light_green}
          colors={[colors.light_green]}
        />
      }
    >
      <View style={styles.content}>
        <MotionView style={styles.topBar}>
          <BrandLogo />
          <TouchableOpacity
            onPress={() => navigation.navigate(Routes.Settings)}
            style={styles.avatar}
            accessibilityRole="button"
            accessibilityLabel="Open your profile and settings"
            activeOpacity={0.75}
          >
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </MotionView>

        <MotionView delay={50} style={styles.greeting}>
          <Text style={styles.eyebrow}>
            {today
              .toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })
              .toUpperCase()}
          </Text>
          <Text style={styles.heading}>
            A little better,
            <Text style={styles.greenText}>{'\n'}every day.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Hey {displayName.split(' ')[0]}, let’s make room for you.
          </Text>
        </MotionView>

        <MotionView delay={110} style={styles.focusCard}>
          <View style={styles.focusTop}>
            <View style={styles.focusCopy}>
              <View style={styles.focusLabelRow}>
                <View style={styles.liveDot} />
                <Text style={styles.focusLabel}>TODAY’S FOCUS</Text>
              </View>
              <Text style={styles.focusTitle}>
                {!hasLoaded
                  ? 'Make today\ncount.'
                  : allDone
                    ? 'You showed up.'
                    : habits.length === 0
                      ? 'Start something\ngood.'
                      : 'Make today\ncount.'}
              </Text>
              {!hasLoaded ? (
                <SkeletonBlock
                  width="100%"
                  height={12}
                  style={styles.focusPlaceholder}
                />
              ) : (
                <Text style={styles.focusMeta}>
                  {habits.length === 0
                    ? 'Your next chapter starts small.'
                    : `${completed} of ${habits.length} habits completed`}
                </Text>
              )}
            </View>
            {!hasLoaded ? (
              <SkeletonBlock
                width={92}
                height={92}
                borderRadius={46}
                style={styles.ringPlaceholder}
              />
            ) : (
              <ProgressRing progress={progress} size={92} />
            )}
          </View>
          <Button
            text={
              !hasLoaded
                ? 'Let’s check in'
                : habits.length === 0
                  ? 'Create your first habit'
                  : allDone
                    ? 'View today’s habits'
                    : 'Let’s check in'
            }
            className="bg-dark_bg rounded-2xl py-3.5"
            disabled={!hasLoaded}
            textClassName="text-white text-sm font-semibold"
            icon={
              <MaterialDesignIcons
                name={
                  hasLoaded && habits.length === 0 ? 'plus' : 'arrow-top-right'
                }
                color={colors.light_green}
                size={19}
              />
            }
            onPress={() =>
              navigation.navigate(
                habits.length === 0 ? Routes.NewHabit : Routes.TodayHabits,
              )
            }
          />
        </MotionView>

        <MotionView delay={170}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your weekly rhythm</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(Routes.Progress)}
              accessibilityRole="button"
              accessibilityLabel="View all progress"
              hitSlop={10}
            >
              <MaterialDesignIcons
                name="arrow-top-right"
                size={22}
                color={colors.grey_text}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <View>
                {showProgressSkeleton ? (
                  <SkeletonBlock width={62} height={38} />
                ) : (
                  <Text style={styles.weekValue}>
                    {averageRate}
                    <Text style={styles.percent}>%</Text>
                  </Text>
                )}
                <Text style={styles.weekDescription}>Average completion</Text>
              </View>
              <View style={styles.periodBadge}>
                <Text style={styles.periodText}>LAST 7 DAYS</Text>
              </View>
            </View>
            {showProgressSkeleton ? (
              <WeeklyChartSkeleton />
            ) : (
              <View style={styles.bars}>
                {week.map(({ date, key }, index) => {
                  const day = data.find(item => item.day_date === key);
                  const rate = Math.min(
                    100,
                    Math.max(0, day?.completion_rate ?? 0),
                  );
                  const isToday = index === 6;
                  return (
                    <View
                      key={key}
                      style={styles.barColumn}
                      accessible
                      accessibilityLabel={`${date.toLocaleDateString('en-US', { weekday: 'long' })}: ${rate}% complete`}
                    >
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${rate}%` },
                            isToday && styles.barFillToday,
                          ]}
                        />
                        {rate === 100 && (
                          <MaterialDesignIcons
                            name="check"
                            color={colors.dark_bg}
                            size={13}
                            style={styles.barCheck}
                          />
                        )}
                      </View>
                      <Text
                        style={[styles.dayText, isToday && styles.todayText]}
                      >
                        {date
                          .toLocaleDateString('en-US', { weekday: 'short' })
                          .slice(0, 1)}
                      </Text>
                      <View
                        style={[styles.dayDot, isToday && styles.todayDot]}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </MotionView>

        <MotionView delay={230}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Your routine
              <Text style={styles.routineCount}>
                {' '}
                {showHabitSkeleton
                  ? ''
                  : habits.length.toString().padStart(2, '0')}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(Routes.Habits)}
              accessibilityRole="button"
              style={styles.seeAll}
              hitSlop={8}
            >
              <Text style={styles.link}>See all</Text>
              <MaterialDesignIcons
                name="chevron-right"
                size={16}
                color={colors.light_green}
              />
            </TouchableOpacity>
          </View>
          {showHabitSkeleton ? (
            <HabitListSkeleton />
          ) : (
            habits.slice(0, 3).map(habit => {
              const checked = completedIds.has(habit.id);
              return (
                <TouchableOpacity
                  key={habit.id}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  onPress={() =>
                    navigation.navigate(Routes.HabitDetails, { habit })
                  }
                  style={styles.habitRow}
                >
                  <View style={styles.habitIcon}>
                    <MaterialDesignIcons
                      name={getHabitIcon(habit.name) as any}
                      size={23}
                      color={colors.light_green}
                    />
                  </View>
                  <View style={styles.habitCopy}>
                    <Text style={styles.habitName} numberOfLines={1}>
                      {habit.name}
                    </Text>
                    <Text style={styles.habitMeta} numberOfLines={1}>
                      {checked
                        ? 'Done for today. Nicely done.'
                        : habit.goal || 'A small daily commitment'}
                    </Text>
                  </View>
                  <MaterialDesignIcons
                    name={checked ? 'check-circle' : 'chevron-right'}
                    size={checked ? 23 : 20}
                    color={checked ? colors.light_green : colors.grey_text}
                  />
                </TouchableOpacity>
              );
            })
          )}
          {!showHabitSkeleton && (
            <TouchableOpacity
              onPress={() => navigation.navigate(Routes.NewHabit)}
              activeOpacity={0.7}
              accessibilityRole="button"
              style={styles.addHabit}
            >
              <MaterialDesignIcons
                name="plus"
                size={20}
                color={colors.light_green}
              />
              <Text style={styles.addHabitText}>
                Make space for a new habit
              </Text>
            </TouchableOpacity>
          )}
        </MotionView>
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>GROW AT YOUR OWN PACE</Text>
          <View style={styles.footerLine} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.dark_bg },
  content: { paddingHorizontal: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.card_border,
    backgroundColor: colors.dark_grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.light_green },
  greeting: { marginBottom: 26 },
  eyebrow: {
    color: colors.grey_text,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: '600',
    marginBottom: 10,
  },
  heading: {
    color: colors.white,
    fontSize: 39,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -1.6,
  },
  greenText: { color: colors.light_green },
  subtitle: {
    color: colors.grey_text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  focusCard: {
    backgroundColor: colors.light_green,
    padding: 22,
    borderRadius: 26,
    marginBottom: 30,
  },
  focusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  focusCopy: { flex: 1 },
  focusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 13,
  },
  liveDot: {
    height: 5,
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.dark_green,
  },
  focusLabel: {
    color: colors.dark_green,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  focusTitle: {
    color: colors.dark_bg,
    fontSize: 29,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  focusMeta: {
    color: colors.dark_green,
    fontSize: 11,
    marginTop: 10,
    lineHeight: 16,
  },
  focusPlaceholder: {
    marginTop: 10,
    maxWidth: 145,
    backgroundColor: '#8AAB8C',
  },
  ringPlaceholder: { backgroundColor: '#8AAB8C' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  weekCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.dark_grey,
    borderWidth: 1,
    borderColor: colors.card_border,
    marginBottom: 28,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  weekValue: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  percent: { color: colors.light_green, fontSize: 20 },
  weekDescription: { color: colors.grey_text, fontSize: 10, marginTop: 2 },
  periodBadge: {
    backgroundColor: colors.icon_bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodText: {
    color: colors.light_green,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bars: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  barColumn: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '100%',
    maxWidth: 26,
    height: 74,
    backgroundColor: '#272A27',
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: 7, backgroundColor: '#617663' },
  barFillToday: { backgroundColor: colors.light_green },
  barCheck: { position: 'absolute', top: 8, alignSelf: 'center' },
  dayText: { marginTop: 10, fontSize: 10, color: colors.grey_text },
  todayText: { color: colors.light_green, fontWeight: '700' },
  dayDot: { width: 3, height: 3, borderRadius: 2, marginTop: 5 },
  todayDot: { backgroundColor: colors.light_green },
  routineCount: { fontSize: 13, color: colors.grey_text, fontWeight: '400' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  link: { color: colors.light_green, fontSize: 11, fontWeight: '600' },
  habitRow: {
    backgroundColor: colors.dark_grey,
    borderColor: colors.card_border,
    borderWidth: 1,
    borderRadius: 19,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  habitIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.icon_bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  habitCopy: { flex: 1, marginRight: 10 },
  habitName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  habitMeta: { color: colors.grey_text, fontSize: 10 },
  addHabit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.light_grey,
    borderStyle: 'dashed',
    borderRadius: 17,
    paddingVertical: 16,
    marginTop: 3,
  },
  addHabitText: { color: colors.light_green, fontSize: 12, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 30,
    marginBottom: 8,
  },
  footerLine: { height: 1, flex: 1, backgroundColor: colors.card_border },
  footerText: { color: colors.grey_text, fontSize: 7, letterSpacing: 1.5 },
});

export default HomeScreen;
