export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  goal?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitReminder {
  id: string;
  habit_id: string;
  reminder_time: string;
  is_enabled: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  created_at: string;
}

export interface CreateHabitInput {
  id?: string;
  name: string;
  description?: string | null;
  goal?: string | null;
  reminders?: string[]; // ["09:00", "18:00"]
}

export type UpdateHabitInput = Partial<
  Pick<Habit, 'name' | 'description' | 'goal'>
> & {
  reminders?: string[];
};

export interface HabitSaveResult {
  habit: Habit;
  remindersSynced: boolean;
}
