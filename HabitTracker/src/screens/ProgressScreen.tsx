import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarComponent, ProgressCurveChart } from '../components';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import MotionView from '../components/MotionView';
import { SkeletonBlock, TrendChartSkeleton } from '../components/Skeleton';
import { useHabitCompletionRange, CompletionDay } from '../hooks';
import { getDateRange } from '../utils';
import { getLocalDateString } from '../utils/dateUtils';
import { useToday } from '../hooks/useToday';

const ProgressScreen = () => {
  const insets = useSafeAreaInsets();
  // --- Monthly Trend (last 30 days) ---
  const today = useToday();
  const { startDate, endDate } = useMemo(
    () => getDateRange(29, today),
    [today],
  );

  const { data, averageRate, trend, loading, refetch } =
    useHabitCompletionRange({
      startDate,
      endDate,
      autoFetch: false,
    });

  // --- Calendar (visible month) ---
  const [calMonth, setCalMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  const { calStartDate, calEndDate } = useMemo(() => {
    const start = new Date(calMonth.year, calMonth.month - 1, 1);
    const end = new Date(calMonth.year, calMonth.month, 0);
    return { calStartDate: start, calEndDate: end };
  }, [calMonth]);

  const {
    data: calData,
    loading: calendarLoading,
    refetch: refetchCalendar,
  } = useHabitCompletionRange({
    startDate: calStartDate,
    endDate: calEndDate,
    autoFetch: false,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchCalendar();
    }, [refetch, refetchCalendar]),
  );

  const markedDates = useMemo(() => {
    const result: Record<string, { marked: boolean; dotColor: string }> = {};
    const todayStr = getLocalDateString(today);
    calData.forEach((d: CompletionDay) => {
      if (d.total_habits === 0) return; // no habits existed that day — skip
      if (d.day_date > todayStr) return; // future dates — never completed, skip
      let dotColor: string;
      if (d.completion_rate === 100) {
        dotColor = colors.light_green; // full completion
      } else if (d.completion_rate > 0) {
        dotColor = colors.yellow; // partial
      } else {
        dotColor = colors.red; // missed
      }
      result[d.day_date] = { marked: true, dotColor };
    });
    return result;
  }, [calData, today]);

  const showStatsSkeleton = loading && data.length === 0;
  const completedDays = data.filter(
    day => day.total_habits > 0 && day.completion_rate === 100,
  ).length;

  return (
    <ScrollView
      className="flex-1 bg-dark_bg"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 32 }}
    >
      <View className="px-6">
        <MotionView className="mb-7">
          <Text className="text-grey_text text-xs font-bold tracking-[3px] mb-2">
            THE BIGGER PICTURE
          </Text>
          <Text className="text-white text-[34px] font-bold tracking-tight">
            Your progress
          </Text>
          <Text className="text-grey_text text-sm mt-2">
            Every small step adds up.
          </Text>
        </MotionView>

        <MotionView delay={60} className="flex-row gap-3 mb-7">
          <View className="flex-1 rounded-3xl p-5 bg-light_green border border-light_green">
            <MaterialDesignIcons
              name="chart-line"
              size={22}
              color={colors.dark_green}
            />
            {showStatsSkeleton ? (
              <SkeletonBlock
                width={78}
                height={44}
                borderRadius={10}
                style={styles.greenStatSkeleton}
              />
            ) : (
              <Text
                className="text-dark_bg font-bold mt-4 tracking-tight"
                style={styles.statNumber}
                numberOfLines={1}
              >
                {averageRate}
                <Text style={styles.statPercent}>%</Text>
              </Text>
            )}
            <Text
              className="text-dark_green text-xs font-semibold mt-1"
              style={styles.statLabel}
            >
              Average completion
            </Text>
            <Text
              className="text-dark_green text-[10px] mt-1"
              style={styles.statPeriod}
            >
              LAST 30 DAYS
            </Text>
          </View>
          <View className="flex-1 rounded-3xl p-5 bg-dark_grey border border-card_border">
            <MaterialDesignIcons
              name="calendar-check-outline"
              size={22}
              color={colors.light_green}
            />
            {showStatsSkeleton ? (
              <SkeletonBlock
                width={60}
                height={44}
                borderRadius={10}
                style={styles.statSkeleton}
              />
            ) : (
              <Text
                className="text-white font-bold mt-4 tracking-tight"
                style={styles.statNumber}
                numberOfLines={1}
              >
                {completedDays}
              </Text>
            )}
            <Text
              className="text-off_white text-xs font-semibold mt-1"
              style={styles.statLabel}
            >
              Perfect days
            </Text>
            <Text
              className="text-grey_text text-[10px] mt-1"
              style={styles.statPeriod}
            >
              LAST 30 DAYS
            </Text>
          </View>
        </MotionView>

        <MotionView delay={120}>
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-white text-xl font-bold tracking-tight"
              style={styles.sectionHeading}
              numberOfLines={1}
            >
              Your consistency
            </Text>
            {calendarLoading ? (
              <View
                className="flex-row items-center gap-2"
                accessible
                accessibilityLabel="Loading calendar history"
                accessibilityState={{ busy: true }}
              >
                <SkeletonBlock width={24} height={8} borderRadius={4} />
                <Text className="text-grey_text text-[10px]">Loading</Text>
              </View>
            ) : (
              <MaterialDesignIcons
                name="calendar-month-outline"
                size={20}
                color={colors.grey_text}
              />
            )}
          </View>
          <View className="bg-dark_grey border border-card_border rounded-3xl p-3 mb-7">
            <CalendarComponent
              markedDates={markedDates}
              onMonthChange={month =>
                setCalMonth({ year: month.year, month: month.month })
              }
            />
            <View className="flex-row justify-center gap-5 pt-4 pb-3">
              {[
                { label: 'Complete', color: colors.light_green },
                { label: 'Partial', color: colors.yellow },
                { label: 'Missed', color: colors.red },
              ].map(item => (
                <View
                  key={item.label}
                  className="flex-row items-center gap-1.5"
                >
                  <View
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-grey_text text-[10px]">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </MotionView>
        <MotionView delay={180}>
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className="text-white text-xl font-bold tracking-tight"
              style={styles.sectionHeading}
              numberOfLines={1}
            >
              Monthly rhythm
            </Text>
            <Text className="text-grey_text text-xs">Last 30 days</Text>
          </View>
          <View className="bg-dark_grey border border-card_border rounded-3xl p-5 mb-5 overflow-hidden">
            {loading && data.length === 0 ? (
              <TrendChartSkeleton />
            ) : (
              <>
                <View className="flex-row items-center justify-between mb-6">
                  <View>
                    <Text className="text-grey_text text-xs mb-1">
                      Completion rate
                    </Text>
                    <Text className="text-white text-3xl font-bold">
                      {averageRate}%
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1 rounded-full px-3 py-2 bg-icon_bg">
                    <MaterialDesignIcons
                      name={trend >= 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={trend >= 0 ? colors.light_green : colors.red}
                    />
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: trend >= 0 ? colors.light_green : colors.red,
                      }}
                    >
                      {trend >= 0 ? '+' : ''}
                      {trend}%
                    </Text>
                  </View>
                </View>
                <ProgressCurveChart data={data} />
              </>
            )}
          </View>
        </MotionView>
        <View className="flex-row items-start gap-3 px-1 pt-2">
          <MaterialDesignIcons
            name="sprout-outline"
            color={colors.light_green}
            size={23}
          />
          <View className="flex-1">
            <Text className="text-off_white text-sm font-semibold mb-1">
              Progress takes practice.
            </Text>
            <Text className="text-grey_text text-xs leading-5">
              A missed day is just a pause. Your next small step is what
              matters.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statSkeleton: { marginTop: 16 },
  greenStatSkeleton: { marginTop: 16, backgroundColor: '#8AAB8C' },
  statNumber: { fontSize: 36, lineHeight: 44, includeFontPadding: false },
  statPercent: { fontSize: 20, lineHeight: 44, includeFontPadding: false },
  statLabel: { lineHeight: 16, minHeight: 32, includeFontPadding: false },
  statPeriod: { lineHeight: 14, includeFontPadding: false },
  sectionHeading: { flex: 1, marginRight: 12, lineHeight: 28 },
});

export default ProgressScreen;
