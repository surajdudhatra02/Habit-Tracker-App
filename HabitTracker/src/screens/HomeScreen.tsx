import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Button, HomeBarChart, SuccessRate } from '../components';
import { MainTabParamList, RootStackParamList } from '../navigation';
import { Routes } from '../navigation/route';
import { colors } from '../constants';
import { useHabitCompletionRange, useAuth } from '../hooks';
import { getDateRange, getHabitIcon, daysSince } from '../utils';
import { useHabitStore } from '../store';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const toTodayHabit = () => navigation.navigate(Routes.TodayHabits);
  const toNewHabitScreen = () => navigation.navigate(Routes.NewHabit);

  const habits = useHabitStore(s => s.habits);
  const fetchHabits = useHabitStore(s => s.fetchHabits);
  const getTodayCompletions = useHabitStore(s => s.getTodayCompletions);
  const [completedTodayCount, setCompletedTodayCount] = useState(0);

  // Last 7 days — weekly count
  const { startDate, endDate } = useMemo(() => getDateRange(6), []);

  const {
    data,
    averageRate,
    loading,
    refetch: refetchRange,
  } = useHabitCompletionRange({
    startDate,
    endDate,
  });

  const loadData = useCallback(async () => {
    try {
      const [, completions] = await Promise.all([
        fetchHabits(),
        getTodayCompletions(),
        refetchRange(),
      ]);
      if (completions) {
        setCompletedTodayCount(completions.length);
      }
    } catch (error) {
      console.error('Failed to load home screen data:', error);
    }
  }, [fetchHabits, getTodayCompletions, refetchRange]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  return (
    <ScrollView
      className="flex-1 bg-dark_bg"
      showsVerticalScrollIndicator={false}
      bounces={true}
      scrollEventThrottle={16}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <View className="p-6">
        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-light_green mb-2">
            Hello, {displayName} 👋
          </Text>
          <Text className="text-grey_text text-base">
            You're on a roll! Keep up the great work.
          </Text>
        </View>

        {/* Today's Habit Card */}
        <View className="bg-dark_grey p-5 rounded-2xl mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="p-4 bg-light_grey rounded-2xl mr-4">
                <FontAwesome
                  name="snowflake-o"
                  size={30}
                  color={colors.white}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xl text-white font-semibold mb-1">
                  Today's Habit
                </Text>
                <Text className="text-grey_text text-sm">
                  {habits.length === 0
                    ? 'No habits scheduled for today'
                    : completedTodayCount === habits.length
                      ? 'All done for today! 🎉'
                      : `${completedTodayCount} of ${habits.length} habits completed`}
                </Text>
              </View>
            </View>

            <Button
              text="Check-in"
              className="bg-light_green px-4 py-2 rounded-2xl ml-3"
              textClassName="text-dark_bg font-bold text-sm"
              onPress={toTodayHabit}
            />
          </View>
        </View>

        {/* Progress Section */}
        <View className="mb-6">
          <Text className="text-off_white text-2xl font-bold mb-4">
            Weekly Progress
          </Text>

          <View className="bg-dark_grey p-4 rounded-2xl">
            {loading ? (
              <ActivityIndicator
                size="large"
                color={colors.light_green}
                className="py-8"
              />
            ) : (
              <HomeBarChart data={data} />
            )}
          </View>

          {/* Success Rate Box */}
          <SuccessRate percentage={averageRate} />
        </View>

        {/* My Habits Preview */}
        {habits.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-off_white text-2xl font-bold">
                My Habits
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(Routes.Habits)}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-semibold mr-1"
                  style={{ color: colors.light_green }}
                >
                  See All
                </Text>
                <MaterialDesignIcons
                  name="chevron-right"
                  size={16}
                  color={colors.light_green}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {habits.slice(0, 5).map(habit => {
                const icon = getHabitIcon(habit.name);
                const days = daysSince(habit.created_at);
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() =>
                      navigation.navigate(Routes.HabitDetails, { habit })
                    }
                    activeOpacity={0.75}
                    className="bg-dark_grey rounded-2xl p-4 items-center"
                    style={{ width: 110 }}
                  >
                    <View
                      className="rounded-2xl p-3 mb-3"
                      style={{ backgroundColor: colors.icon_bg }}
                    >
                      <MaterialDesignIcons
                        name={icon as any}
                        size={24}
                        color={colors.light_green}
                      />
                    </View>
                    <Text
                      className="text-off_white text-sm font-semibold mb-2 text-center"
                      numberOfLines={1}
                    >
                      {habit.name}
                    </Text>
                    <View
                      className="flex-row items-center px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: colors.icon_bg }}
                    >
                      <MaterialDesignIcons
                        name="fire"
                        size={10}
                        color={colors.light_green}
                      />
                      <Text
                        className="text-xs font-semibold ml-1"
                        style={{ color: colors.light_green }}
                      >
                        {days}d
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
