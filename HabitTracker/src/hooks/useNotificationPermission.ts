import { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import notifee, {
  AndroidNotificationSetting,
  AuthorizationStatus,
} from '@notifee/react-native';

export const useNotificationPermission = (userId: string | null) => {
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!userId || checkedRef.current) return;
    let active = true;

    const requestPermissions = async () => {
      try {
        const settings = await notifee.requestPermission();
        if (!active) return;
        checkedRef.current = true;

        const granted =
          settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

        if (!granted) {
          console.warn('[Permissions] Notification permission denied.');
          return;
        }

        if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
          const alarmSettings = await notifee.getNotificationSettings();
          if (
            active &&
            alarmSettings.android.alarm === AndroidNotificationSetting.DISABLED
          ) {
            Alert.alert(
              'Enable Exact Reminders',
              'To receive habit reminders at the exact time you set, enable Alarms & reminders for Habitz in Settings.',
              [
                { text: 'Not Now', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    notifee.openAlarmPermissionSettings().catch(error => {
                      console.error('Unable to open alarm settings:', error);
                    });
                  },
                },
              ],
            );
          }
        }
      } catch (err) {
        console.error('[Permissions] Failed to request permissions:', err);
      }
    };

    requestPermissions();
    return () => {
      active = false;
    };
  }, [userId]);
};
