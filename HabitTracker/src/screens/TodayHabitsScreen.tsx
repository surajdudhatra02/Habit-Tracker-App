import { View, Text, ScrollView } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import MotionView from '../components/MotionView';
import ProgressRing from '../components/ProgressRing';
import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CheckboxCard } from '../components';
import { HabitListSkeleton, SkeletonBlock } from '../components/Skeleton';
import { useHabitStore } from '../store';
import { Habit } from '../types';
import { colors } from '../constants';
import { showErrorToast } from '../utils/toast';
import { useToday } from '../hooks/useToday';
import { getLocalDateString } from '../utils/dateUtils';
import { getHabitIcon } from '../utils/habitUtils';

const TodayHabitsScreen = () => {
  const habits = useHabitStore(s => s.habits);
  const fetchHabits = useHabitStore(s => s.fetchHabits);
  const getTodayCompletions = useHabitStore(s => s.getTodayCompletions);
  const toggleCompletion = useHabitStore(s => s.toggleCompletion);
  const today = useToday();

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadedDay, setLoadedDay] = useState<string | null>(null);
  const todayKey = getLocalDateString(today);

  const togglingIdsRef = useRef<Set<string>>(new Set());

  const loadScreenData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [, completions] = await Promise.all([
        fetchHabits(),
        getTodayCompletions(),
      ]);
      if (getLocalDateString(today) !== getLocalDateString()) return;
      setCompletedIds(new Set(completions.map(c => c.habit_id)));
      setLoadedDay(getLocalDateString(today));
    } catch (error) {
      console.error('Failed to load today habits screen data:', error);
      showErrorToast('Error', 'Unable to load habits. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchHabits, getTodayCompletions, today]);

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
        showErrorToast('Error', 'Unable to update habit. Please try again.');
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

  const showSkeleton = isLoading && loadedDay !== todayKey;
  const total = habits.length;
  const completed = habits.filter(habit => completedIds.has(habit.id)).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <ScrollView
      className="flex-1 bg-dark_bg"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="p-6">
        <MotionView className="mb-7">
          <Text className="text-grey_text text-[10px] font-semibold tracking-[2px] mb-3">
            {today
              .toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
              .toUpperCase()}
          </Text>
          <Text className="text-white text-[34px] leading-[39px] font-bold tracking-tight">
            One habit at{'\n'}
            <Text className="text-light_green">a time.</Text>
          </Text>
          <Text className="mt-3 text-sm text-grey_text">
            A few small promises to yourself.
          </Text>
        </MotionView>

        <MotionView
          delay={60}
          className="bg-dark_grey border border-card_border rounded-3xl p-5 mb-8 flex-row items-center justify-between"
        >
          <View className="flex-1 mr-4">
            <Text className="text-grey_text text-[10px] font-semibold tracking-widest mb-2">
              DAILY MOMENTUM
            </Text>
            {showSkeleton ? (
              <SkeletonBlock width={82} height={36} borderRadius={10} />
            ) : (
              <Text className="text-white text-3xl font-bold">
                {completed}
                <Text className="text-grey_text text-xl"> / {total}</Text>
              </Text>
            )}
            <Text className="text-grey_text text-xs mt-2">
              {total > 0 && completed === total
                ? 'All done. Take a moment to enjoy it.'
                : 'Show up. Check in. Feel good.'}
            </Text>
          </View>
          {showSkeleton ? (
            <SkeletonBlock width={82} height={82} borderRadius={41} />
          ) : (
            <ProgressRing
              progress={progress}
              size={82}
              color={colors.light_green}
              trackColor={colors.light_grey}
              textColor={colors.white}
            />
          )}
        </MotionView>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-lg font-bold">
            Your daily check-in
          </Text>
          {showSkeleton ? (
            <SkeletonBlock width={72} height={12} borderRadius={4} />
          ) : (
            <Text className="text-grey_text text-[11px]">
              {Math.max(0, total - completed)} remaining
            </Text>
          )}
        </View>

        {showSkeleton ? (
          <HabitListSkeleton />
        ) : habits.length === 0 ? (
          <MotionView
            delay={120}
            className="bg-dark_grey rounded-3xl border border-card_border items-center py-12 px-6"
          >
            <MaterialDesignIcons
              name="sprout-outline"
              color={colors.light_green}
              size={36}
            />
            <Text className="text-white text-lg font-semibold text-center mt-4">
              A fresh start awaits
            </Text>
            <Text className="text-sm text-center text-grey_text mt-2 leading-6">
              No habits yet. Create one to get started!
            </Text>
          </MotionView>
        ) : (
          habits.map((habit: Habit, index) => {
            const isCompleted = completedIds.has(habit.id);
            const isToggling = togglingIds.has(habit.id);
            return (
              <MotionView
                key={habit.id}
                delay={120 + Math.min(index, 5) * 50}
                className={`rounded-3xl bg-dark_grey p-4 mb-3 border ${isCompleted ? 'border-icon_bg' : 'border-card_border'}`}
                pointerEvents={isToggling ? 'none' : 'auto'}
                accessibilityState={{ busy: isToggling }}
              >
                <CheckboxCard
                  icon={getHabitIcon(habit.name) as any}
                  label={habit.name}
                  description={habit.description ?? undefined}
                  time={isCompleted ? 'Completed today' : 'Every day'}
                  goal={habit.goal ?? undefined}
                  checked={isCompleted}
                  onValueChange={value => handleToggle(habit.id, value)}
                />
              </MotionView>
            );
          })
        )}
        <View className="flex-row items-center justify-center gap-2 mt-6">
          <MaterialDesignIcons
            name="heart-outline"
            size={14}
            color={colors.grey_text}
          />
          <Text className="text-grey_text text-[10px]">
            Consistency is a practice, not perfection.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TodayHabitsScreen;
