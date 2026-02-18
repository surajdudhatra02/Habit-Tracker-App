export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal?: string;
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
  name: string;
  description?: string;
  goal?: string;
  reminders?: string[]; // ["09:00", "18:00"]
}
