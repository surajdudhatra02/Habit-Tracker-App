import { useEffect } from 'react';
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
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const messaging = getMessaging();
    const saveToken = async (token: string) => {
      if (!active || !token) return;
      // This key already identifies a single account/token pair. Never delete
      // tokens by platform: other installations must remain registered.
      const { error } = await supabase.from('device_tokens').upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,token' },
      );
      if (error) throw error;
    };
    const reportError = (error: unknown) => {
      if (!active) return;
      console.error('[FCM] Token registration failed:', error);
      showErrorToast(
        'Unable to register push notifications',
        'Please reopen the app to retry.',
      );
    };
    const register = async () => {
      const permission = await requestPermission(messaging);
      if (
        !active ||
        (permission !== AuthorizationStatus.AUTHORIZED &&
          permission !== AuthorizationStatus.PROVISIONAL)
      )
        return;
      const token = await getToken(messaging);
      await saveToken(token);
    };
    const unsubscribe = onTokenRefresh(messaging, token => {
      saveToken(token).catch(reportError);
    });
    register().catch(reportError);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);
};
