import { View, Text, ScrollView, Alert } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CheckboxCard, LoadingState } from '../components';
import { useHabits } from '../hooks';
import { Habit } from '../types';
import { colors } from '../constants';

const TodayHabitsScreen = () => {
  const { habits, fetchHabits, getTodayCompletions, toggleCompletion } =
    useHabits();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const togglingIdsRef = useRef<Set<string>>(new Set());

  const loadScreenData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [, completions] = await Promise.all([
        fetchHabits(),
        getTodayCompletions(),
      ]);
      setCompletedIds(new Set(completions.map(c => c.habit_id)));
    } catch (error) {
      console.error('Failed to load today habits screen data:', error);
      Alert.alert('Error', 'Unable to load habits. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchHabits, getTodayCompletions]);

  useFocusEffect(
    useCallback(() => {
      loadScreenData();
    }, [loadScreenData]),
  );

  const handleToggle = useCallback(
    async (habitId: string, value: boolean) => {
      if (togglingIdsRef.current.has(habitId)) return;

      togglingIdsRef.current.add(habitId);
      setTogglingIds(prev => new Set(prev).add(habitId));

      setCompletedIds(prev => {
        const next = new Set(prev);
        value ? next.add(habitId) : next.delete(habitId);
        return next;
      });

      try {
        await toggleCompletion(habitId, value);
      } catch (error) {
        console.error(`Failed to toggle habit ${habitId}:`, error);
        setCompletedIds(prev => {
          const next = new Set(prev);
          value ? next.delete(habitId) : next.add(habitId);
          return next;
        });
        Alert.alert('Error', 'Unable to update habit. Please try again.');
      } finally {
        togglingIdsRef.current.delete(habitId);
        setTogglingIds(prev => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      }
    },
    [toggleCompletion],
  );

  const total = habits.length;
  const completed = habits.filter(habit => completedIds.has(habit.id)).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <ScrollView
      className="flex-1 bg-dark_bg"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 gap-6 p-6">
        <View>
          <Text
            className="text-3xl font-bold"
            style={{ color: colors.light_green }}
          >
            Today
          </Text>
          <Text className="mt-1 text-sm text-grey_text">
            {completed}/{total} habits completed
          </Text>
        </View>

        {total > 0 && (
          <View className="h-2 overflow-hidden rounded-full bg-dark_grey">
            <View
              className="h-2 rounded-full"
              style={{
                backgroundColor: colors.light_green,
                width: `${progress}%`,
              }}
            />
          </View>
        )}

        {isLoading ? (
          <View className="items-center py-16">
            <LoadingState />
          </View>
        ) : habits.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-sm text-center text-grey_text">
              No habits yet. Create one to get started!
            </Text>
          </View>
        ) : (
          habits.map((habit: Habit) => {
            const isCompleted = completedIds.has(habit.id);
            const isToggling = togglingIds.has(habit.id);
            return (
              <View
                key={habit.id}
                className="rounded-xl bg-dark_grey p-4"
                style={isCompleted ? { opacity: 0.6 } : undefined}
                pointerEvents={isToggling ? 'none' : 'auto'}
              >
                <CheckboxCard
                  icon="repeat"
                  label={habit.name}
                  description={habit.description}
                  time="Daily"
                  goal={habit.goal}
                  checked={isCompleted}
                  onValueChange={value => handleToggle(habit.id, value)}
                />
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default TodayHabitsScreen;
