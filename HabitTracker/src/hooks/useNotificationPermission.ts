import { useEffect } from 'react';
import { Platform, Alert, AppState } from 'react-native';
import notifee, {
  AndroidNotificationSetting,
  AuthorizationStatus,
} from '@notifee/react-native';
import { useHabitStore } from '../store/useHabitStore';

export const useNotificationPermission = (userId: string | null) => {
  useEffect(() => {
    if (!userId) return;
    let active = true;
    let alarmEnabled: boolean | undefined;
    let checkingAlarm = false;

    const checkAlarmAccess = async (showPrompt = false) => {
      if (
        Platform.OS !== 'android' ||
        Number(Platform.Version) < 31 ||
        checkingAlarm
      )
        return;
      checkingAlarm = true;
      try {
        const settings = await notifee.getNotificationSettings();
        if (!active) return;
        const enabled =
          settings.android.alarm === AndroidNotificationSetting.ENABLED;
        const previouslyEnabled = alarmEnabled;
        alarmEnabled = enabled;

        // Settings returns to the running app after a grant. Replace approximate
        // schedules with exact ones, using the currently signed-in account only.
        if (enabled && previouslyEnabled === false) {
          const store = useHabitStore.getState();
          if (store.userId === userId) await store.rescheduleAllReminders();
        }
        if (showPrompt && !enabled) {
          Alert.alert(
            'Enable Exact Reminders',
            'Allow Alarms & reminders for Habitz to receive reminders at the time you choose. Without this access, Android may delay your reminders. You can keep using Habitz without enabling it.',
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (!active) return;
                  notifee.openAlarmPermissionSettings().catch(error => {
                    console.error('Unable to open alarm settings:', error);
                  });
                },
              },
            ],
          );
        }
      } finally {
        checkingAlarm = false;
      }
    };

    const requestPermissions = async () => {
      try {
        const settings = await notifee.requestPermission();
        if (!active) return;
        const granted =
          settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
        if (!granted) {
          console.warn('[Permissions] Notification permission denied.');
          return;
        }
        await checkAlarmAccess(true);
      } catch (err) {
        console.error('[Permissions] Failed to request permissions:', err);
      }
    };

    requestPermissions();
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active' || !active) return;
      checkAlarmAccess().catch(error => {
        console.error('[Permissions] Failed to refresh alarm access:', error);
      });
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [userId]);
};
