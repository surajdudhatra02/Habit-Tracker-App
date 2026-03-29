import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Button, HomeBarChart, SuccessRate } from '../components';
import { MainTabParamList, RootStackParamList } from '../navigation';
import { Routes } from '../navigation/route';
import { colors } from '../constants';
import { useHabitCompletionRange } from '../hooks';
import { getDateRange } from '../utils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = ({ navigation }: Props) => {
  const toTodayHabit = () => navigation.navigate(Routes.TodayHabits);
  const toNewHabitScreen = () => navigation.navigate(Routes.NewHabit);

  // Last 7 days — weekly count
  const { startDate, endDate } = useMemo(() => getDateRange(6), []);

  const { data, averageRate, loading } = useHabitCompletionRange({
    startDate,
    endDate,
  });

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
            Home, User !!
          </Text>
          <Text className="text-grey_text text-base">
            You're on a roll! Keep up the great work.
          </Text>
        </View>

        {/* Today's Habit Card */}
        <View className="bg-dark_grey p-5 rounded-xl mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="p-4 bg-light_grey rounded-xl mr-4">
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
                  Meditate for 10 minutes
                </Text>
              </View>
            </View>

            <Button
              text="Check-in"
              className="bg-light_green px-4 py-2 rounded-lg ml-3"
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

          <View className="bg-dark_grey p-4 rounded-xl">
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

        {/* Add Habit Button */}
        <View className="mb-6 gap-4">
          <Button
            icon={
              <MaterialDesignIcons
                name="plus-circle-outline"
                size={18}
                color={colors.black}
              />
            }
            text="Add/Change Habit"
            className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center"
            textClassName="text-black font-bold text-base ml-2"
            onPress={toNewHabitScreen}
          />
          <Button
            text="Habits"
            className="rounded-xl border-light_green border px-6 py-4"
            textClassName="text-light_green text-base font-bold"
            onPress={() => navigation.navigate(Routes.Habits)}
            icon={
              <MaterialDesignIcons
                name="format-list-bulleted"
                size={18}
                color={colors.light_green}
              />
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
