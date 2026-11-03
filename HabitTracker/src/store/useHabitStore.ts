import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  CreateHabitInput,
  Habit,
  HabitCompletion,
  HabitReminder,
  HabitSaveResult,
  UpdateHabitInput,
} from '../types';
import {
  cancelAllHabitReminders,
  cancelHabitReminders,
  scheduleAllRemindersForHabit,
} from '../lib/notifee';
import { showErrorToast } from '../utils/toast';
import { getLocalDateString } from '../utils/dateUtils';
import { newHabitId } from '../utils/ids';

interface HabitStore {
  habits: Habit[];
  loading: boolean;
  userId: string | null;
  setUserId: (userId: string | null) => Promise<void>;
  fetchHabits: () => Promise<void>;
  createHabit: (input: CreateHabitInput) => Promise<HabitSaveResult>;
  updateHabit: (
    habitId: string,
    updates: UpdateHabitInput,
  ) => Promise<HabitSaveResult>;
  deleteHabit: (habitId: string) => Promise<void>;
  getHabitReminders: (habitId: string) => Promise<HabitReminder[]>;
  getTodayCompletions: () => Promise<HabitCompletion[]>;
  toggleCompletion: (habitId: string, completed: boolean) => Promise<void>;
  /** Re-registers all habits' reminders with the OS. Call on app open. */
  rescheduleAllReminders: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => {
  let sessionVersion = 0;
  let fetchVersion = 0;
  let initialized = false;
  let pendingReminderRestore: number | null = null;

  const isCurrentSession = (version: number, userId: string | null) =>
    version === sessionVersion && userId === get().userId;

  const reconcileSavedHabit = async (
    habit: Habit,
    version: number,
    userId: string,
  ): Promise<boolean> => {
    const isCurrent = () =>
      isCurrentSession(version, userId) &&
      get().habits.some(current => current.id === habit.id);
    if (!isCurrent()) return false;
    try {
      const reminders = await get().getHabitReminders(habit.id);
      if (!isCurrent()) return false;
      await scheduleAllRemindersForHabit(
        habit.id,
        habit.name,
        reminders
          .filter(reminder => reminder.is_enabled)
          .map(reminder => reminder.reminder_time),
        isCurrent,
      );
      return isCurrent();
    } catch (error) {
      console.error(
        'Habit saved, but device reminders could not be synchronized:',
        error,
      );
      return false;
    }
  };

  return {
    habits: [],
    loading: false,
    userId: null,

    setUserId: async userId => {
      if (initialized && userId === get().userId) return;
      initialized = true;
      const version = ++sessionVersion;
      pendingReminderRestore = userId ? version : null;
      ++fetchVersion;
      set({ userId, habits: [], loading: false });
      try {
        await cancelAllHabitReminders();
        if (!userId || !isCurrentSession(version, userId)) return;
        await get().fetchHabits();
      } catch (error) {
        if (isCurrentSession(version, userId)) initialized = false;
        throw error;
      }
    },

    fetchHabits: async () => {
      const { userId } = get();
      if (!userId) return;
      const version = sessionVersion;
      const request = ++fetchVersion;
      const isCurrent = () =>
        isCurrentSession(version, userId) && request === fetchVersion;
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (isCurrent()) {
          set({ habits: data || [] });
          // The winning fetch restores alarms even if a screen refresh superseded
          // the initialization request while it was loading.
          if (pendingReminderRestore === version) {
            pendingReminderRestore = null;
            await get().rescheduleAllReminders();
          }
        }
      } catch (error: any) {
        if (isCurrent()) throw error;
      } finally {
        if (isCurrent()) set({ loading: false });
      }
    },

    createHabit: async (input: CreateHabitInput) => {
      const { userId } = get();
      if (!userId) throw new Error('User not authenticated');
      const version = sessionVersion;
      const { data, error } = await supabase
        .rpc('create_habit_with_reminders', {
          p_habit_id: input.id ?? newHabitId(),
          p_name: input.name.trim(),
          p_description: input.description ?? null,
          p_goal: input.goal ?? null,
          p_reminders: input.reminders ?? [],
        })
        .single();
      if (error) throw error;
      const habit = data as Habit;
      if (isCurrentSession(version, userId)) {
        ++fetchVersion;
        set(state => ({
          habits: [
            habit,
            ...state.habits.filter(current => current.id !== habit.id),
          ],
          loading: false,
        }));
      }
      const remindersSynced = await reconcileSavedHabit(habit, version, userId);
      return { habit, remindersSynced };
    },

    updateHabit: async (habitId: string, updates: UpdateHabitInput) => {
      const { userId } = get();
      if (!userId) throw new Error('User not authenticated');
      const version = sessionVersion;
      const { reminders, ...fields } = updates;
      const { data, error } = await supabase
        .rpc('update_habit_with_reminders', {
          p_habit_id: habitId,
          p_updates: fields,
          p_reminders: reminders ?? null,
        })
        .single();
      if (error) throw error;
      const habit = data as Habit;
      if (isCurrentSession(version, userId)) {
        ++fetchVersion;
        set(state => ({
          habits: state.habits.map(current =>
            current.id === habit.id ? habit : current,
          ),
          loading: false,
        }));
      }
      const remindersSynced = await reconcileSavedHabit(habit, version, userId);
      return { habit, remindersSynced };
    },

    deleteHabit: async (habitId: string) => {
      const { userId } = get();
      if (!userId) throw new Error('User not authenticated');
      const version = sessionVersion;
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', userId)
        .select('id')
        .single();
      if (error) throw error;
      if (isCurrentSession(version, userId)) {
        ++fetchVersion;
        set(state => ({
          habits: state.habits.filter(habit => habit.id !== habitId),
          loading: false,
        }));
      }
      try {
        await cancelHabitReminders(habitId);
      } catch (cleanupError) {
        // The delete already committed. Report the notification failure separately
        // so the user is not encouraged to retry a completed database mutation.
        console.error(
          'Habit deleted, but reminder cleanup failed:',
          cleanupError,
        );
        if (isCurrentSession(version, userId)) {
          showErrorToast(
            'Habit deleted',
            'Unable to clear its reminders. Reopen the app to retry.',
          );
        }
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
        throw error;
      }
    },

    getTodayCompletions: async (): Promise<HabitCompletion[]> => {
      const { userId } = get();
      if (!userId) return [];
      try {
        const today = getLocalDateString();
        const { data, error } = await supabase
          .from('habit_completions')
          .select('*')
          .eq('user_id', userId)
          .eq('completed_at', today);
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('Error fetching completions:', error.message);
        throw error;
      }
    },

    toggleCompletion: async (habitId: string, completed: boolean) => {
      const { userId } = get();
      if (!userId) throw new Error('User not authenticated');
      try {
        const today = getLocalDateString();
        if (completed) {
          const { error } = await supabase.from('habit_completions').upsert(
            {
              habit_id: habitId,
              user_id: userId,
              completed_at: today,
            },
            { onConflict: 'habit_id,completed_at', ignoreDuplicates: true },
          );
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

    /**
     * Re-registers all habit reminders with the OS AlarmManager / UNNotificationCenter.
     * Call this on every app open (after habits are fetched) to handle:
     *   - Phone reboot (AlarmManager clears all alarms on restart)
     *   - App update / reinstall
     *   - Clear app data (Android)
     */
    rescheduleAllReminders: async () => {
      const { habits, getHabitReminders, userId } = get();
      const version = sessionVersion;
      const isCurrent = () => isCurrentSession(version, userId);
      if (!userId || habits.length === 0) return;

      for (const habit of habits) {
        if (!isCurrent()) return;
        try {
          const reminders = await getHabitReminders(habit.id);
          if (!isCurrent()) return;
          const enabledTimes = reminders
            .filter(r => r.is_enabled)
            .map(r => r.reminder_time);

          await scheduleAllRemindersForHabit(
            habit.id,
            habit.name,
            enabledTimes,
            () =>
              isCurrent() &&
              get().habits.some(current => current.id === habit.id),
          );
        } catch (err: any) {
          if (!isCurrent()) return;
          showErrorToast("Failed to reschedule today's reminders");
          console.error(
            `[Reminders] Failed to reschedule for habit ${habit.id}:`,
            err.message,
          );
        }
      }
    },
  };
});
