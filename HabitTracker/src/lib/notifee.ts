import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import type { TimestampTrigger } from '@notifee/react-native';
import { Platform } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export const NOTIFICATION_CHANNEL_ID = 'habitz_default';

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
      channelId: NOTIFICATION_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
};

// ── Local Habit Reminder Scheduling ──────────────────────────────────────────
// Uses Notifee TriggerNotifications backed by:
//   Android → AlarmManager.setExactAndAllowWhileIdle() (fires in Doze mode)
//   iOS     → UNUserNotificationCenter (OS-managed, app does not need to run)
//
// The OS fires these even when the app is KILLED. No JS code runs to trigger
// them — they are scheduled into the OS kernel at creation time.

const buildReminderId = (habitId: string, reminderTime: string): string => {
  // Normalize "08:00:00" → "0800", "08:00" → "0800"
  const normalized = reminderTime.substring(0, 5).replace(':', '');
  return `habit-reminder-${habitId}-${normalized}`;
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

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextOccurrenceMs(hours, minutes),
    repeatFrequency: RepeatFrequency.DAILY,

    // allowWhileIdle = true → uses setExactAndAllowWhileIdle on Android,
    // which fires the alarm even in Doze/power-save mode.
    // Requires SCHEDULE_EXACT_ALARM (API 31-32) or USE_EXACT_ALARM (API 33+).
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification(
    {
      id: buildReminderId(habitId, reminderTime),
      title: habitName,
      body: 'Time to complete your habit for today!',
      data: { habitId, type: 'habit_reminder' },
      android: {
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

export const cancelHabitReminders = async (habitId: string): Promise<void> => {
  const allIds = await notifee.getTriggerNotificationIds();
  const prefix = `habit-reminder-${habitId}-`;
  const toCancel = allIds.filter(id => id.startsWith(prefix));

  await Promise.all(toCancel.map(id => notifee.cancelTriggerNotification(id)));

  // if (toCancel.length > 0) {
  //   console.log(
  //     `[Notifee] Cancelled ${toCancel.length} reminder(s) for habit: ${habitId}`,
  //   );
  // }
};

// Call on habit create and habit update.
export const scheduleAllRemindersForHabit = async (
  habitId: string,
  habitName: string,
  reminderTimes: string[], // ["08:00", "18:30"]
): Promise<void> => {

  // Cancel existing reminders first to prevent duplicates
  await cancelHabitReminders(habitId);

  // Schedule each reminder time
  await Promise.all(
    reminderTimes.map(time => scheduleHabitReminder(habitId, habitName, time)),
  );
};

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
