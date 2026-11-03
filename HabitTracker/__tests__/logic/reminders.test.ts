import notifee from '@notifee/react-native';
import {
  cancelAllHabitReminders,
  scheduleAllRemindersForHabit,
} from '../../src/lib/notifee';

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(),
    getTriggerNotificationIds: jest.fn(),
    cancelTriggerNotification: jest.fn(),
    createTriggerNotification: jest.fn(),
  },
  AndroidImportance: { HIGH: 4 },
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
