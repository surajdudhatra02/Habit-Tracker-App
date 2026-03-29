import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  CreateHabitInput,
  Habit,
  HabitCompletion,
  HabitReminder,
} from '../types';

interface HabitStore {
  habits: Habit[];
  loading: boolean;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  fetchHabits: () => Promise<void>;
  createHabit: (input: CreateHabitInput) => Promise<Habit>;
  updateHabit: (
    habitId: string,
    updates: Partial<Habit> & { reminders?: string[] },
  ) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  getHabitReminders: (habitId: string) => Promise<HabitReminder[]>;
  getTodayCompletions: () => Promise<HabitCompletion[]>;
  toggleCompletion: (habitId: string, completed: boolean) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  loading: false,
  userId: null,

  setUserId: userId => {
    set({ userId });
    if (userId) {
      get().fetchHabits();
    } else {
      set({ habits: [] });
    }
  },

  fetchHabits: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ habits: data || [] });
    } catch (error: any) {
      console.error('Error fetching habits:', error.message);
    } finally {
      set({ loading: false });
    }
  },

  createHabit: async (input: CreateHabitInput) => {
    const { userId, fetchHabits } = get();
    if (!userId) throw new Error('User not authenticated');
    try {
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
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

  updateHabit: async (
    habitId: string,
    updates: Partial<Habit> & { reminders?: string[] },
  ) => {
    const { fetchHabits } = get();
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

  deleteHabit: async (habitId: string) => {
    const { fetchHabits } = get();
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

  getHabitReminders: async (habitId: string): Promise<HabitReminder[]> => {
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

  getTodayCompletions: async (): Promise<HabitCompletion[]> => {
    const { userId } = get();
    if (!userId) return [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed_at', today);
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching completions:', error.message);
      return [];
    }
  },

  toggleCompletion: async (habitId: string, completed: boolean) => {
    const { userId } = get();
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      if (completed) {
        const { error } = await supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: today,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', userId)
          .eq('completed_at', today);
        if (error) throw error;
      }

      // No need to fetchHabits here as habit_completions is joined elsewhere
    } catch (error: any) {
      console.error('Error toggling completion:', error.message);
      throw error;
    }
  },
}));
