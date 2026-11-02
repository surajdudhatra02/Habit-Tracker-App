import { useEffect, useRef } from 'react';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { showErrorToast } from '../utils/toast';

export const useFCMToken = (userId: string | null) => {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!userId || registeredRef.current) return;

    const messaging = getMessaging();

    const registerToken = async () => {
      try {
        const authStatus = await requestPermission(messaging);

        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          return;
        }

        const token = await getToken(messaging);

        if (!token) {
          return;
        }

        // Delete all existing tokens for this user on this platform first.
        // Prevents stale token buildup when user re-logs in or reinstalls.
        await supabase
          .from('device_tokens')
          .delete()
          .eq('user_id', userId)
          .eq('platform', Platform.OS);

        const { error } = await supabase.from('device_tokens').insert({
          user_id: userId,
          token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('[FCM] Failed to save token to DB:', error.message);
          showErrorToast(error.message, 'Error');
        } else {
          registeredRef.current = true;
        }
      } catch (err) {
        console.error('[FCM] Error during token registration:', err);
        showErrorToast(err?.message ?? 'Something went wrong', 'Error');
      }
    };

    registerToken();

    const unsubscribe = onTokenRefresh(messaging, async newToken => {
      await supabase.from('device_tokens').upsert(
        {
          user_id: userId,
          token: newToken,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id, token',
        },
      );
    });

    return () => unsubscribe();
  }, [userId]);
};
