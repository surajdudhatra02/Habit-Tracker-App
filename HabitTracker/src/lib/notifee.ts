import notifee, {
  AlarmType,
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  EventType,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import type { TimestampTrigger } from '@notifee/react-native';
import { Platform } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { colors } from '../constants/colors';

export const NOTIFICATION_CHANNEL_ID = 'habitz_default';

// The status icon must be monochrome with a transparent background. Keep the
// full-color brand artwork separate for notification layouts with a large icon.
const androidBranding = {
  smallIcon: 'ic_stat_habitz',
  largeIcon: 'ic_habitz_notification_large',
  color: colors.light_green,
};

export const createNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: 'Habitz Notifications',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default',
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();

  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  if (!granted) {
    console.warn('[Notifee] Notification permission denied by user.');
  }

  return granted;
};

export const displayFromRemoteMessage = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
  await createNotificationChannel();

  const title =
    (remoteMessage.data?.title as string | undefined) ??
    remoteMessage.notification?.title;

  const body =
    (remoteMessage.data?.body as string | undefined) ??
    remoteMessage.notification?.body;

  await notifee.displayNotification({
    title: title ?? 'Habitz',
    body: body ?? '',
    data: remoteMessage.data,
    android: {
      ...androidBranding,
      channelId: NOTIFICATION_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
      showTimestamp: true,
    },
  });
};

// ── Local Habit Reminder Scheduling ──────────────────────────────────────────
// Uses Notifee TriggerNotifications backed by:
//   Android → exact AlarmManager when allowed, approximate WorkManager otherwise
//   iOS     → UNUserNotificationCenter (OS-managed, app does not need to run)
//
// The OS fires these even when the app is KILLED. No JS code runs to trigger
// them — scheduling is managed by the OS. Approximate delivery may be delayed.

const REMINDER_PREFIX = 'habit-reminder-';

// Serialize native mutations so logout cannot finish cancellation while an
// earlier scheduling operation is still creating alarms.
let reminderQueue: Promise<unknown> = Promise.resolve();
const enqueueReminderOperation = <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  const result = reminderQueue.then(operation);
  reminderQueue = result.catch(() => {});
  return result;
};

const buildReminderId = (habitId: string, reminderTime: string): string => {
  // Normalize "08:00:00" → "0800", "08:00" → "0800"
  const normalized = reminderTime.substring(0, 5).replace(':', '');
  return `${REMINDER_PREFIX}${habitId}-${normalized}`;
};

// Calculates the timestamp of the next daily occurrence of HH:MM
// If that time has already passed today, schedules for tomorrow
const nextOccurrenceMs = (hours: number, minutes: number): number => {
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
};

/**
 * Schedules a DAILY repeating local notification for one habit at one time.
 *
 * @param habitId       - Unique habit ID (used to build notification ID)
 * @param habitName     - Displayed as the notification title
 * @param reminderTime  - "HH:MM" or "HH:MM:SS" (24-hour format)
 */
export const scheduleHabitReminder = async (
  habitId: string,
  habitName: string,
  reminderTime: string,
): Promise<void> => {
  await createNotificationChannel();

  const [hoursStr, minutesStr] = reminderTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  let useExactAlarm = Platform.OS === 'android';
  if (useExactAlarm && Number(Platform.Version) >= 31) {
    const settings = await notifee.getNotificationSettings();
    useExactAlarm =
      settings.android.alarm === AndroidNotificationSetting.ENABLED;
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextOccurrenceMs(hours, minutes),
    repeatFrequency: RepeatFrequency.DAILY,

    // Omitting alarmManager uses Notifee's WorkManager scheduler on Android.
    // Exact timing is only requested when Alarms & reminders access is granted.
    ...(useExactAlarm
      ? { alarmManager: { type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE } }
      : {}),
  };

  await notifee.createTriggerNotification(
    {
      id: buildReminderId(habitId, reminderTime),
      title: habitName,
      body: 'Time to complete your habit for today!',
      data: { habitId, type: 'habit_reminder' },
      android: {
        ...androidBranding,
        channelId: NOTIFICATION_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
        showTimestamp: true,
      },
    },
    trigger,
  );

  // console.log(
  //   `[Notifee] Reminder scheduled: "${habitName}" at ${reminderTime.substring(0, 5)}`,
  // );
};

// Cancels ALL scheduled reminders for a given habit.

const cancelHabitRemindersNow = async (habitId?: string): Promise<void> => {
  const allIds = await notifee.getTriggerNotificationIds();
  const prefix = habitId ? `${REMINDER_PREFIX}${habitId}-` : REMINDER_PREFIX;
  const toCancel = allIds.filter(id => id.startsWith(prefix));

  // Wait for every native operation, including when one cancellation fails.
  const results = await Promise.allSettled(
    toCancel.map(id => notifee.cancelTriggerNotification(id)),
  );
  const failure = results.find(result => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;

  // if (toCancel.length > 0) {
  //   console.log(
  //     `[Notifee] Cancelled ${toCancel.length} reminder(s) for habit: ${habitId}`,
  //   );
  // }
};

export const cancelHabitReminders = (habitId: string): Promise<void> =>
  enqueueReminderOperation(() => cancelHabitRemindersNow(habitId));

// Enumerate the OS rather than the in-memory habit list, which can be empty
// after restart or contain only part of the previous account's habits.
export const cancelAllHabitReminders = (): Promise<void> =>
  enqueueReminderOperation(() => cancelHabitRemindersNow());

// Call on habit create and habit update.
export const scheduleAllRemindersForHabit = (
  habitId: string,
  habitName: string,
  reminderTimes: string[], // ["08:00", "18:30"]
  isCurrent: () => boolean = () => true,
): Promise<void> =>
  enqueueReminderOperation(async () => {
    if (!isCurrent()) return;
    await cancelHabitRemindersNow(habitId);
    for (const time of new Set(reminderTimes)) {
      if (!isCurrent()) return;
      await scheduleHabitReminder(habitId, habitName, time);
    }
  });

// ── Foreground Tap Handler ─────────────────────────────────────────────────────
// Returns the habitId from a notification if it was a habit reminder tap.

export const getHabitIdFromNotification = (
  notificationData?: Record<string, string | object>,
): string | null => {
  if (!notificationData) return null;
  if (notificationData.type !== 'habit_reminder') return null;
  return (notificationData.habitId as string) ?? null;
};

export { EventType };
export { notifee as default };
