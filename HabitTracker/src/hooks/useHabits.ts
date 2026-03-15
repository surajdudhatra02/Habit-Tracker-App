import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  CreateHabitInput,
  Habit,
  HabitCompletion,
  HabitReminder,
} from '../types';
import { supabase } from '../lib/supabase';

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHabits(data || []);
    } catch (error: any) {
      console.error('Error fetching habits:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createHabit = useCallback(
    async (input: CreateHabitInput) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const { data: habit, error: habitError } = await supabase
          .from('habits')
          .insert({
            user_id: user.id,
            name: input.name,
            description: input.description,
            goal: input.goal,
          })
          .select()
          .single();
        if (habitError) throw habitError;

        if (input.reminders && input.reminders.length > 0) {
          const reminders = input.reminders.map(time => ({
            habit_id: habit.id,
            reminder_time: `${time}:00`,
          }));
          const { error: reminderError } = await supabase
            .from('habit_reminders')
            .insert(reminders);
          if (reminderError) throw reminderError;
        }

        await fetchHabits();
        return habit;
      } catch (error: any) {
        console.error('Error creating habit:', error.message);
        throw error;
      }
    },
    [user, fetchHabits],
  );

  const updateHabit = useCallback(
    async (
      habitId: string,
      updates: Partial<Habit> & { reminders?: string[] },
    ) => {
      try {
        const { reminders, ...habitUpdates } = updates;
        const { error } = await supabase
          .from('habits')
          .update(habitUpdates)
          .eq('id', habitId);
        if (error) throw error;

        if (reminders !== undefined) {
          const { error: deleteError } = await supabase
            .from('habit_reminders')
            .delete()
            .eq('habit_id', habitId);
          if (deleteError) throw deleteError;

          if (reminders.length > 0) {
            const { error: insertError } = await supabase
              .from('habit_reminders')
              .insert(
                reminders.map(time => ({
                  habit_id: habitId,
                  reminder_time: `${time}:00`,
                })),
              );
            if (insertError) throw insertError;
          }
        }
        await fetchHabits();
      } catch (error: any) {
        console.error('Error updating habit:', error.message);
        throw error;
      }
    },
    [fetchHabits],
  );

  const deleteHabit = useCallback(
    async (habitId: string) => {
      try {
        const { error } = await supabase
          .from('habits')
          .delete()
          .eq('id', habitId);
        if (error) throw error;
        await fetchHabits();
      } catch (error: any) {
        console.error('Error deleting habit:', error.message);
        throw error;
      }
    },
    [fetchHabits],
  );

  const getHabitReminders = useCallback(
    async (habitId: string): Promise<HabitReminder[]> => {
      try {
        const { data, error } = await supabase
          .from('habit_reminders')
          .select('*')
          .eq('habit_id', habitId);
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching reminders:', error.message);
        return [];
      }
    },
    [],
  );

  const getTodayCompletions = useCallback(async (): Promise<
    HabitCompletion[]
  > => {
    if (!user) return [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_at', today);
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching completions:', error.message);
      return [];
    }
  }, [user]);

  const toggleCompletion = useCallback(
    async (habitId: string, completed: boolean) => {
      if (!user) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        if (completed) {
          const { error } = await supabase.from('habit_completions').insert({
            habit_id: habitId,
            user_id: user.id,
            completed_at: today,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('habit_completions')
            .delete()
            .eq('habit_id', habitId)
            .eq('user_id', user.id)
            .eq('completed_at', today);
          if (error) throw error;
        }
      } catch (error: any) {
        console.error('Error toggling completion:', error.message);
        throw error;
      }
    },
    [user],
  );

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user, fetchHabits]);

  return {
    habits,
    loading,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    getHabitReminders,
    getTodayCompletions,
    toggleCompletion,
  };
};
