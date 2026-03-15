import { View, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CheckboxCard } from '../components';
import { useHabits } from '../hooks';
import { Habit } from '../types';
import { colors } from '../constants';

const TodayHabitsScreen = () => {
  const { habits, fetchHabits, getTodayCompletions, toggleCompletion } =
    useHabits();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    React.useCallback(() => {
      fetchHabits();
      loadCompletions();
    }, []),
  );

  const loadCompletions = async () => {
    const completions = await getTodayCompletions();
    setCompletedIds(new Set(completions.map(c => c.habit_id)));
  };

  const handleToggle = async (habitId: string, value: boolean) => {
    // Prevent double tap
    if (togglingIds.has(habitId)) return;

    // Optimistic update
    setCompletedIds(prev => {
      const next = new Set(prev);
      value ? next.add(habitId) : next.delete(habitId);
      return next;
    });

    try {
      await toggleCompletion(habitId, value);
    } catch {
      // Revert
      setCompletedIds(prev => {
        const next = new Set(prev);
        value ? next.delete(habitId) : next.add(habitId);
        return next;
      });
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  const completed = habits.filter(h => completedIds.has(h.id)).length;
  const total = habits.length;

  return (
    <ScrollView className="bg-dark_bg flex-1">
      <View className="flex-1 p-6 gap-6">
        {/* Header */}
        <View>
          <Text
            className="text-3xl font-bold"
            style={{ color: colors.light_green }}
          >
            Today
          </Text>
          <Text className="text-grey_text text-sm mt-1">
            {completed}/{total} habits completed
          </Text>
        </View>

        {/* Progress bar */}
        {total > 0 && (
          <View className="h-2 bg-dark_grey rounded-full overflow-hidden">
            <View
              className="h-2 rounded-full"
              style={{
                backgroundColor: colors.light_green,
                width: `${(completed / total) * 100}%`,
              }}
            />
          </View>
        )}

        {/* Habits list */}
        {habits.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-grey_text text-sm text-center">
              No habits yet. Create one to get started!
            </Text>
          </View>
        ) : (
          habits.map((habit: Habit) => (
            <View
              key={habit.id}
              className="bg-dark_grey rounded-xl p-4"
              style={completedIds.has(habit.id) ? { opacity: 0.6 } : {}}
              pointerEvents={togglingIds.has(habit.id) ? 'none' : 'auto'}
            >
              <CheckboxCard
                icon="repeat"
                label={habit.name}
                description={habit.description}
                time="Daily"
                goal={habit.goal}
                checked={completedIds.has(habit.id)}
                onValueChange={value => handleToggle(habit.id, value)}
              />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default TodayHabitsScreen;
