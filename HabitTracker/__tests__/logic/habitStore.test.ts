import { useHabitStore } from '../../src/store/useHabitStore';
import { supabase } from '../../src/lib/supabase';
import {
  cancelAllHabitReminders,
  cancelHabitReminders,
  scheduleAllRemindersForHabit,
} from '../../src/lib/notifee';
import { memoryBackend } from './memoryBackend';

jest.mock('../../src/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));
jest.mock('../../src/utils/ids', () => {
  let counter = 0;
  return { newHabitId: () => `test-habit-${++counter}` };
});
jest.mock('../../src/lib/notifee', () => ({
  cancelAllHabitReminders: jest.fn(),
  cancelHabitReminders: jest.fn(),
  scheduleAllRemindersForHabit: jest.fn(),
}));
jest.mock('../../src/utils/toast', () => ({ showErrorToast: jest.fn() }));

const habit = {
  id: 'habit-a',
  user_id: 'alice',
  name: 'Read',
  description: 'Old description',
};
const reminder = {
  id: 'reminder-a',
  habit_id: 'habit-a',
  reminder_time: '09:00:00',
  is_enabled: true,
};
let backend: ReturnType<typeof memoryBackend>;
let errorLog: jest.SpyInstance;
const store = () => useHabitStore.getState();

beforeEach(() => {
  jest.resetAllMocks();
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  backend = memoryBackend({
    habits: [habit],
    habit_reminders: [reminder],
    habit_completions: [],
  });
  (supabase.from as jest.Mock).mockImplementation(backend.from);
  (supabase.rpc as jest.Mock).mockImplementation(backend.rpc);
  useHabitStore.setState({
    userId: 'alice',
    habits: [habit] as any,
    loading: false,
  });
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 10, 3, 0, 30));
});

afterEach(() => {
  jest.useRealTimers();
  errorLog.mockRestore();
});

test('control: successful creation persists one habit and schedules its reminder', async () => {
  const created = await store().createHabit({
    name: 'Walk',
    reminders: ['18:00'],
  });
  expect(backend.tables.habits).toHaveLength(2);
  expect(scheduleAllRemindersForHabit).toHaveBeenCalledWith(
    created.habit.id,
    'Walk',
    ['18:00:00'],
    expect.any(Function),
  );
});

test('check-in belongs to the local calendar day after midnight', async () => {
  await store().toggleCompletion('habit-a', true);
  expect(backend.tables.habit_completions[0].completed_at).toBe('2026-11-03');
});

test('today lookup returns a completion saved for the local day', async () => {
  backend.tables.habit_completions.push({
    habit_id: 'habit-a',
    user_id: 'alice',
    completed_at: '2026-11-03',
  });
  expect(await store().getTodayCompletions()).toHaveLength(1);
});

test('logout cancels reminders previously scheduled for the signed-out account', async () => {
  const alarms = new Set<string>();
  (scheduleAllRemindersForHabit as jest.Mock).mockImplementation(async id => {
    alarms.add(id);
  });
  (cancelHabitReminders as jest.Mock).mockImplementation(async id => {
    alarms.delete(id);
  });
  (cancelAllHabitReminders as jest.Mock).mockImplementation(async () => {
    alarms.clear();
  });
  await store().rescheduleAllReminders();
  expect(alarms.size).toBe(1);
  await store().setUserId(null);
  expect([...alarms]).toEqual([]);
});

test('a response started before logout must not restore the signed-out user habits', async () => {
  let finish!: (value: any) => void;
  const delayed = new Promise(resolve => {
    finish = resolve;
  });
  (supabase.from as jest.Mock).mockReturnValue({
    select: () => ({ eq: () => ({ order: () => delayed }) }),
  });
  const pending = store().fetchHabits();
  store().setUserId(null);
  expect(store().habits).toEqual([]);
  finish({ data: [habit], error: null });
  await pending;
  expect(store().habits).toEqual([]);
});

test('logging back into the same account still invalidates the previous session request', async () => {
  let finish!: (value: any) => void;
  const delayed = new Promise(resolve => {
    finish = resolve;
  });
  (supabase.from as jest.Mock).mockImplementationOnce(() => ({
    select: () => ({ eq: () => ({ order: () => delayed }) }),
  }));
  const pending = store().fetchHabits();
  await store().setUserId(null);
  await store().setUserId('alice');
  finish({ data: [{ ...habit, name: 'Obsolete' }], error: null });
  await pending;
  expect(store().habits[0].name).toBe('Read');
});

test('an older request cannot overwrite a newer refresh in the same session', async () => {
  let finish!: (value: any) => void;
  const delayed = new Promise(resolve => {
    finish = resolve;
  });
  (supabase.from as jest.Mock).mockImplementationOnce(() => ({
    select: () => ({ eq: () => ({ order: () => delayed }) }),
  }));
  const pending = store().fetchHabits();
  await store().fetchHabits();
  finish({ data: [{ ...habit, name: 'Obsolete' }], error: null });
  await pending;
  expect(store().habits[0].name).toBe('Read');
});

test('retrying creation after reminder-write failure must not create duplicate habits', async () => {
  backend.failNext('habit_reminders', 'insert');
  await expect(
    store().createHabit({ name: 'Walk', reminders: ['18:00'] }),
  ).rejects.toBeDefined();
  await store().createHabit({ name: 'Walk', reminders: ['18:00'] });
  expect(backend.tables.habits.filter(row => row.name === 'Walk')).toHaveLength(
    1,
  );
});

test('an update that fails writing replacement reminders must preserve the old reminders', async () => {
  backend.failNext('habit_reminders', 'insert');
  await expect(
    store().updateHabit('habit-a', { reminders: ['10:00'] }),
  ).rejects.toBeDefined();
  expect(backend.tables.habit_reminders).toEqual([reminder]);
});

test('a failed database delete must leave reminders active for the surviving habit', async () => {
  const alarms = new Set(['habit-a']);
  (cancelHabitReminders as jest.Mock).mockImplementation(async id => {
    alarms.delete(id);
  });
  backend.failNext('habits', 'delete');
  await expect(store().deleteHabit('habit-a')).rejects.toBeDefined();
  expect(backend.tables.habits).toHaveLength(1);
  expect(alarms.has('habit-a')).toBe(true);
});

test('completion load failure must be distinguishable from an empty day', async () => {
  backend.failNext('habit_completions', 'select');
  await expect(store().getTodayCompletions()).rejects.toBeDefined();
});

test('control: an actually empty day returns no completions', async () => {
  expect(await store().getTodayCompletions()).toEqual([]);
});

test('a committed save reports reminder scheduling failure separately and remains saved', async () => {
  (scheduleAllRemindersForHabit as jest.Mock).mockRejectedValueOnce(
    new Error('Alarms disabled'),
  );
  const result = await store().createHabit({
    id: 'retry-id',
    name: 'Walk',
    reminders: ['18:00'],
  });
  expect(result.remindersSynced).toBe(false);
  expect(store().habits.some(row => row.id === result.habit.id)).toBe(true);
  const retry = await store().createHabit({
    id: 'retry-id',
    name: 'Walk',
    reminders: ['18:00'],
  });
  expect(retry.remindersSynced).toBe(true);
  expect(
    backend.tables.habits.filter(row => row.id === 'retry-id'),
  ).toHaveLength(1);
});

test('a committed delete is not reported as failed when only native cleanup fails', async () => {
  (cancelHabitReminders as jest.Mock).mockRejectedValueOnce(
    new Error('OS busy'),
  );
  await expect(store().deleteHabit('habit-a')).resolves.toBeUndefined();
  expect(store().habits).toEqual([]);
  expect(backend.tables.habits).toEqual([]);
});

test('repeating a check-in is idempotent with the existing database unique key', async () => {
  await store().toggleCompletion('habit-a', true);
  await store().toggleCompletion('habit-a', true);
  expect(backend.tables.habit_completions).toHaveLength(1);
});

test('the winning screen refresh still restores reminders when initialization is superseded', async () => {
  let finish!: (value: any) => void;
  let started!: () => void;
  const waiting = new Promise<void>(resolve => {
    started = resolve;
  });
  const delayed = new Promise(resolve => {
    finish = resolve;
  });
  (supabase.from as jest.Mock).mockImplementationOnce(() => ({
    select: () => ({
      eq: () => ({
        order: () => {
          started();
          return delayed;
        },
      }),
    }),
  }));
  useHabitStore.setState({ userId: null, habits: [] });
  const initialization = store().setUserId('alice');
  await waiting;
  await store().fetchHabits();
  expect(scheduleAllRemindersForHabit).toHaveBeenCalledWith(
    'habit-a',
    'Read',
    ['09:00:00'],
    expect.any(Function),
  );
  finish({ data: [], error: null });
  await initialization;
  expect(store().habits[0].name).toBe('Read');
});

test('initialization may be retried after a native cleanup failure', async () => {
  (cancelAllHabitReminders as jest.Mock).mockRejectedValueOnce(
    new Error('OS busy'),
  );
  await expect(store().setUserId('bob')).rejects.toThrow('OS busy');
  await expect(store().setUserId('bob')).resolves.toBeUndefined();
  expect(cancelAllHabitReminders).toHaveBeenCalledTimes(2);
});
