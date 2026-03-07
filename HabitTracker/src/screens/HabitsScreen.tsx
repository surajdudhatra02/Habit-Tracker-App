import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useState } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import { useHabits } from '../hooks';
import { Habit } from '../types';

const ICON_NAMES = [
  'run-fast',
  'book-open-variant',
  'water',
  'dumbbell',
  'meditation',
  'food-apple',
  'sleep',
  'bicycle',
  'music',
  'pencil',
];

const getHabitIcon = (name: string) => {
  const idx =
    name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    ICON_NAMES.length;
  return ICON_NAMES[idx];
};

const daysSince = (dateString: string) => {
  const created = new Date(dateString);
  const now = new Date();
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const HabitsScreen = ({ navigation }: any) => {
  const { habits, loading, fetchHabits } = useHabits();
  const [refreshing, setRefreshing] = useState(false);

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

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-24">
      <View
        className="rounded-full p-7 mb-6"
        style={{ backgroundColor: '#1C1C1F' }}
      >
        <MaterialDesignIcons
          name="clipboard-list-outline"
          size={56}
          color={colors.light_green}
        />
      </View>
      <Text className="text-off_white text-2xl font-bold mb-3 text-center">
        No Habits Yet
      </Text>
      <Text className="text-grey_text text-sm text-center px-10 leading-6 mb-8">
        Start building better habits today. Small steps lead to big changes.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('NewHabit')}
        activeOpacity={0.85}
        className="flex-row items-center px-7 py-4 rounded-2xl"
        style={{ backgroundColor: colors.light_green }}
      >
        <MaterialDesignIcons name="plus" size={18} color={colors.black} />
        <Text className="text-black font-bold text-base ml-2">
          Create First Habit
        </Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingState = () => (
    <View className="flex-1 items-center justify-center py-24">
      <View
        className="rounded-full p-5 mb-4"
        style={{ backgroundColor: '#1C1C1F' }}
      >
        <MaterialDesignIcons
          name="loading"
          size={36}
          color={colors.light_green}
        />
      </View>
      <Text className="text-grey_text text-sm">Loading your habits…</Text>
    </View>
  );

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

          <TouchableOpacity
            onPress={() => navigation.navigate('NewHabit')}
            activeOpacity={0.85}
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{ backgroundColor: colors.light_green }}
          >
            <MaterialDesignIcons name="plus" size={18} color={colors.black} />
            <Text className="text-black font-bold text-sm ml-1.5">Add</Text>
          </TouchableOpacity>
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
          <EmptyState />
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
                      {/* Icon block */}
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

                      {/* Content */}
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

                        {/* Tags row */}
                        <View className="flex-row items-center flex-wrap gap-x-2 gap-y-1.5 mt-1">
                          {/* Streak badge */}
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

                          {/* Goal badge */}
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

                          {/* Date */}
                          <View className="flex-row items-center">
                            <MaterialDesignIcons
                              name="calendar-outline"
                              size={11}
                              color={colors.grey_text}
                            />
                            <Text className="text-grey_text text-xs ml-1">
                              {formatDate(habit.created_at)}
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
