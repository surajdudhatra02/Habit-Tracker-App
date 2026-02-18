import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { CreateHabitInput, Habit, HabitReminder } from '../types';
import { supabase } from '../lib/supabase';

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
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
  };

  const createHabit = async (input: CreateHabitInput) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // 1. Create habit
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

      // 2. Create reminders if any

      if (input.reminders && input.reminders.length > 0) {
        const reminders = input.reminders.map(time => ({
          habit_id: habit.id,
          reminder_time: `${time}:00`,
        }));

        const { error: reminderError } = await supabase
          .from('habit_reminders')
          .insert(reminders);

        if (reminderError) throw reminderError;

        // 3. Refresh list
        await fetchHabits();
        return habit;
      }
    } catch (error: any) {
      console.error('Error creating habit:', error.message);
      throw error;
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId);

      if (error) throw error;
      await fetchHabits();
    } catch (error: any) {
      console.error('Error updating habit:', error.message);
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
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
  };

  // Get reminders for a habit

  const getHabitReminders = async (
    habitId: string,
  ): Promise<HabitReminder[]> => {
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
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  return {
    habits,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    fetchHabits,
    getHabitReminders,
  };
};
