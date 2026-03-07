import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import { useHabits } from '../hooks';
import { Habit } from '../types';
import { Button, EmptyState, LoadingState } from '../components';
import { getHabitIcon, daysSince, formatDate } from '../utils';

const HabitsScreen = ({ navigation }: any) => {
  const { habits, loading, fetchHabits } = useHabits();
  const [refreshing, setRefreshing] = useState(false);

  // Auto refresh every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchHabits();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchHabits();
    } catch (error) {
      console.error('Error refreshing habits:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-dark_bg">
      {/* ── Header ── */}
      <View
        className="px-6 pt-5 pb-4"
        style={{ borderBottomColor: '#2a2a2d', borderBottomWidth: 1 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text
              className="text-3xl font-bold mb-0.5"
              style={{ color: colors.light_green }}
            >
              My Habits
            </Text>
            <Text className="text-grey_text text-sm">
              {habits.length > 0
                ? `${habits.length} active habit${
                    habits.length !== 1 ? 's' : ''
                  }`
                : 'Build your daily routine'}
            </Text>
          </View>

          <Button
            text="Add"
            className="bg-light_green px-4 py-3 rounded-xl"
            textClassName="text-black font-bold text-sm"
            icon={
              <MaterialDesignIcons name="plus" size={18} color={colors.black} />
            }
            onPress={() => navigation.navigate('NewHabit')}
          />
        </View>

        {/* Summary strip */}
        {habits.length > 0 && (
          <View className="flex-row mt-4 gap-x-3">
            <View
              className="flex-1 rounded-xl px-4 py-3 flex-row items-center"
              style={{ backgroundColor: '#1C1C1F' }}
            >
              <MaterialDesignIcons
                name="fire"
                size={18}
                color={colors.light_green}
              />
              <View className="ml-2">
                <Text className="text-off_white text-sm font-bold">
                  {habits.length}
                </Text>
                <Text className="text-grey_text text-xs">Total</Text>
              </View>
            </View>

            <View
              className="flex-1 rounded-xl px-4 py-3 flex-row items-center"
              style={{ backgroundColor: '#1C1C1F' }}
            >
              <MaterialDesignIcons
                name="calendar-check"
                size={18}
                color={colors.light_green}
              />
              <View className="ml-2">
                <Text className="text-off_white text-sm font-bold">
                  {Math.max(...habits.map(h => daysSince(h.created_at)), 0)}d
                </Text>
                <Text className="text-grey_text text-xs">Longest</Text>
              </View>
            </View>

            <View
              className="flex-1 rounded-xl px-4 py-3 flex-row items-center"
              style={{ backgroundColor: '#1C1C1F' }}
            >
              <MaterialDesignIcons
                name="star-outline"
                size={18}
                color={colors.light_green}
              />
              <View className="ml-2">
                <Text className="text-off_white text-sm font-bold">
                  {habits.filter(h => h.goal).length}
                </Text>
                <Text className="text-grey_text text-xs">With Goal</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ── List ── */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.light_green}
            colors={[colors.light_green]}
          />
        }
      >
        {loading && habits.length === 0 ? (
          <LoadingState />
        ) : habits.length === 0 ? (
          <EmptyState onPress={() => navigation.navigate('NewHabit')} />
        ) : (
          <View className="gap-y-3">
            {habits.map((habit: Habit) => {
              const days = daysSince(habit.created_at);
              const icon = getHabitIcon(habit.name);

              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => navigation.navigate('HabitDetails', { habit })}
                  activeOpacity={0.75}
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: '#1C1C1F' }}
                >
                  <View className="p-4">
                    <View className="flex-row items-start">
                      <View
                        className="rounded-xl p-3 mr-4"
                        style={{ backgroundColor: '#2a352b' }}
                      >
                        <MaterialDesignIcons
                          name={icon as any}
                          size={24}
                          color={colors.light_green}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text
                            className="text-off_white text-base font-bold flex-1 mr-2"
                            numberOfLines={1}
                          >
                            {habit.name}
                          </Text>
                          <MaterialDesignIcons
                            name="chevron-right"
                            size={20}
                            color={colors.grey_text}
                          />
                        </View>

                        {habit.description ? (
                          <Text
                            className="text-grey_text text-sm leading-5 mb-2"
                            numberOfLines={2}
                          >
                            {habit.description}
                          </Text>
                        ) : null}

                        <View className="flex-row items-center flex-wrap gap-x-2 gap-y-1.5 mt-1">
                          <View
                            className="flex-row items-center px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: '#2a352b' }}
                          >
                            <MaterialDesignIcons
                              name="fire"
                              size={11}
                              color={colors.light_green}
                            />
                            <Text
                              className="text-xs font-semibold ml-1"
                              style={{ color: colors.light_green }}
                            >
                              {days}d
                            </Text>
                          </View>

                          {habit.goal ? (
                            <View
                              className="flex-row items-center px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: '#252535' }}
                            >
                              <MaterialDesignIcons
                                name="flag-outline"
                                size={11}
                                color="#8B8BCC"
                              />
                              <Text
                                className="text-xs font-medium ml-1"
                                numberOfLines={1}
                                style={{ color: '#8B8BCC', maxWidth: 120 }}
                              >
                                {habit.goal}
                              </Text>
                            </View>
                          ) : null}

                          <View className="flex-row items-center">
                            <MaterialDesignIcons
                              name="calendar-outline"
                              size={11}
                              color={colors.grey_text}
                            />
                            <Text className="text-grey_text text-xs ml-1">
                              {formatDate(habit.created_at, true)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HabitsScreen;
