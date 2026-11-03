import notifee from '@notifee/react-native';
import { Platform } from 'react-native';
import {
  cancelAllHabitReminders,
  scheduleAllRemindersForHabit,
  scheduleHabitReminder,
} from '../../src/lib/notifee';

jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 36 } }));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(),
    getTriggerNotificationIds: jest.fn(),
    cancelTriggerNotification: jest.fn(),
    createTriggerNotification: jest.fn(),
    getNotificationSettings: jest.fn(),
  },
  AndroidImportance: { HIGH: 4 },
  AlarmType: { SET_EXACT_AND_ALLOW_WHILE_IDLE: 3 },
  AndroidNotificationSetting: { DISABLED: 0, ENABLED: 1 },
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
  EventType: {},
  RepeatFrequency: { DAILY: 1 },
  TriggerType: { TIMESTAMP: 0 },
}));

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(done => {
    resolve = done;
  });
  return { promise, resolve };
};
let alarms: Set<string>;
beforeEach(() => {
  jest.resetAllMocks();
  Object.assign(Platform, { OS: 'android', Version: 36 });
  (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
    android: { alarm: 1 },
  });
  alarms = new Set(['unrelated-push']);
  (notifee.getTriggerNotificationIds as jest.Mock).mockImplementation(
    async () => [...alarms],
  );
  (notifee.cancelTriggerNotification as jest.Mock).mockImplementation(
    async id => {
      alarms.delete(id);
    },
  );
  (notifee.createTriggerNotification as jest.Mock).mockImplementation(
    async notification => {
      alarms.add(notification.id);
    },
  );
});

test.each([31, 33, 36])(
  'Android API %s schedules exact reminders when access is enabled',
  async version => {
    Object.assign(Platform, { Version: version });
    await scheduleHabitReminder('habit', 'Read', '09:00');
    expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'habit-reminder-habit-0900' }),
      expect.objectContaining({
        alarmManager: { type: 3 },
        repeatFrequency: 1,
      }),
    );
  },
);

test.each([31, 33, 36])(
  'Android API %s keeps reminders scheduled approximately when access is denied',
  async version => {
    Object.assign(Platform, { Version: version });
    (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
      android: { alarm: 0 },
    });
    await scheduleAllRemindersForHabit('habit', 'Read', ['09:00', '18:30']);
    expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(2);
    for (const [notification, trigger] of (
      notifee.createTriggerNotification as jest.Mock
    ).mock.calls) {
      expect(notification.data.habitId).toBe('habit');
      expect(trigger.alarmManager).toBeUndefined();
      expect(trigger.repeatFrequency).toBe(1);
      expect(trigger.timestamp).toBeGreaterThan(Date.now());
    }
  },
);

test('older Android versions retain exact scheduling without a permission check', async () => {
  Object.assign(Platform, { Version: 30 });
  await scheduleHabitReminder('habit', 'Read', '09:00');
  expect(notifee.getNotificationSettings).not.toHaveBeenCalled();
  expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ alarmManager: { type: 3 } }),
  );
});

test('iOS keeps its native daily trigger without Android alarm options', async () => {
  Object.assign(Platform, { OS: 'ios', Version: 18 });
  await scheduleHabitReminder('habit', 'Read', '09:00');
  expect(notifee.getNotificationSettings).not.toHaveBeenCalled();
  const [, trigger] = (notifee.createTriggerNotification as jest.Mock).mock
    .calls[0];
  expect(trigger.alarmManager).toBeUndefined();
  expect(trigger.repeatFrequency).toBe(1);
});

test('logout enumerates all habit reminders, including ones absent from the store', async () => {
  alarms.add('habit-reminder-unknown-0900');
  await cancelAllHabitReminders();
  expect([...alarms]).toEqual(['unrelated-push']);
});

test('logout waits for in-flight scheduling before completing cancellation', async () => {
  const started = deferred();
  const finish = deferred();
  (notifee.createTriggerNotification as jest.Mock).mockImplementationOnce(
    async notification => {
      started.resolve();
      await finish.promise;
      alarms.add(notification.id);
    },
  );
  const scheduling = scheduleAllRemindersForHabit('alice-habit', 'Read', [
    '09:00',
  ]);
  await started.promise;
  const logout = cancelAllHabitReminders();
  finish.resolve();
  await Promise.all([scheduling, logout]);
  expect([...alarms]).toEqual(['unrelated-push']);
});

test('an obsolete account cannot schedule reminders queued after logout', async () => {
  await cancelAllHabitReminders();
  await scheduleAllRemindersForHabit(
    'alice-habit',
    'Read',
    ['09:00'],
    () => false,
  );
  expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('a failed native cancellation is surfaced and does not poison later operations', async () => {
  alarms.add('habit-reminder-a-0900');
  (notifee.cancelTriggerNotification as jest.Mock).mockRejectedValueOnce(
    new Error('OS busy'),
  );
  await expect(cancelAllHabitReminders()).rejects.toThrow('OS busy');
  await cancelAllHabitReminders();
  expect([...alarms]).toEqual(['unrelated-push']);
});
