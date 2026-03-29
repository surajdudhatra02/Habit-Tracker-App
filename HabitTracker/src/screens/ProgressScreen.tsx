import { useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Button, CalendarComponent, ProgressCurveChart } from '../components';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import { useHabitCompletionRange, CompletionDay } from '../hooks';

const ProgressScreen = () => {
  // --- Weekly Trend (last 7 days) ---
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { startDate: start, endDate: end };
  }, []);

  const { data, averageRate, trend, loading } = useHabitCompletionRange({
    startDate,
    endDate,
  });

  // --- Calendar (visible month) ---
  const today = new Date();
  const [calMonth, setCalMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  const { calStartDate, calEndDate } = useMemo(() => {
    const start = new Date(calMonth.year, calMonth.month - 1, 1);
    const end = new Date(calMonth.year, calMonth.month, 0);
    return { calStartDate: start, calEndDate: end };
  }, [calMonth]);

  const { data: calData } = useHabitCompletionRange({
    startDate: calStartDate,
    endDate: calEndDate,
  });

  const markedDates = useMemo(() => {
    const result: Record<string, { marked: boolean; dotColor: string }> = {};
    const todayStr = new Date().toISOString().split('T')[0];
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
  }, [calData]);

  const exportIcon = (
    <MaterialDesignIcons name="download" color={colors.light_green} size={18} />
  );
  const shareIcon = (
    <MaterialDesignIcons name="share" color={colors.black} size={18} />
  );

  return (
    <ScrollView className="bg-dark_bg flex-1">
      <View className="flex-1 p-6">
        {/* Daily Completion */}
        <View className="mb-6">
          <Text className="text-off_white text-2xl font-bold mb-4">
            Daily Completion
          </Text>

          <View className="bg-dark_grey p-4 rounded-xl">
            <CalendarComponent
              markedDates={markedDates}
              onMonthChange={month =>
                setCalMonth({ year: month.year, month: month.month })
              }
            />
          </View>
        </View>

        {/* Weekly Trend - Chart */}
        <View className="mb-6">
          <Text className="text-off_white text-2xl font-bold mb-4">
            Weekly Trend
          </Text>

          <View className="bg-dark_grey p-4 rounded-xl">
            {loading ? (
              <ActivityIndicator
                size="large"
                color={colors.light_green}
                className="py-16"
              />
            ) : (
              <>
                <Text className="text-white text-xl">Habit Completion</Text>
                <Text className="text-light_green text-3xl font-bold">
                  {averageRate}%
                </Text>
                <View className="flex-row items-center gap-5">
                  <Text className="text-grey_text text-xl">Last 7 Days</Text>
                  <View className="flex-row items-center gap-1">
                    <MaterialDesignIcons
                      name={trend >= 0 ? 'trending-up' : 'trending-down'}
                      size={18}
                      color={colors.light_green}
                    />
                    <Text className="text-light_green font-semibold text-xl">
                      {trend >= 0 ? `+${trend}%` : `${trend}%`}
                    </Text>
                  </View>
                </View>

                <ProgressCurveChart data={data} />
              </>
            )}
          </View>
        </View>

        {/* Motivational Tip */}
        <View className="mb-6">
          <Text className="text-off_white text-2xl font-bold mb-4">
            Motivational Tip
          </Text>

          <View className="bg-dark_grey p-6 rounded-xl flex-row items-center gap-2">
            <MaterialDesignIcons
              name="lightbulb-outline"
              color={colors.light_green}
              size={30}
            />
            <Text className="text-grey_text italic text-lg flex-1">
              "Consistency is key. Small, daily actions lead to significant
              long-term results. Keep up the great work!"
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-4">
          <Button
            text="Export"
            className="rounded-lg border-light_green border flex-1"
            textClassName="text-light_green text-2xl font-medium"
            onPress={() => console.log('Export Progress')}
            icon={exportIcon}
          />
          <Button
            text="Share"
            className="rounded-lg bg-light_green flex-1"
            textClassName="text-black text-2xl font-medium"
            onPress={() => console.log('Share Progress')}
            icon={shareIcon}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;
