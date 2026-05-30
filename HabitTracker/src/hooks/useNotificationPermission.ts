import { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

export const useNotificationPermission = (userId: string | null) => {
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!userId || checkedRef.current) return;
    checkedRef.current = true;

    const requestPermissions = async () => {
      try {
        const settings = await notifee.requestPermission();

        const granted =
          settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

        if (!granted) {
          console.warn('[Permissions] Notification permission denied.');
          return;
        }

        if (
          Platform.OS === 'android' &&
          (Platform.Version === 31 || Platform.Version === 32)
        ) {
          const alarmEnabled = await notifee.isAlarmPermissionGranted?.();
          if (alarmEnabled === false) {
            Alert.alert(
              'Enable Exact Reminders',
              'To receive habit reminders at the exact time you set, enable Alarms & reminders for Habitz in Settings.',
              [
                { text: 'Not Now', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => notifee.openAlarmPermissionSettings(),
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
  }, [userId]);
};
