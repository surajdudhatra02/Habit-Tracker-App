import { useEffect } from 'react';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { displayFromRemoteMessage } from '../lib/notifee';

export const useForegroundNotification = () => {
  useEffect(() => {
    const unsubscribe = onMessage(getMessaging(), async remoteMessage => {
      await displayFromRemoteMessage(remoteMessage);
    });
    return unsubscribe;
  }, []);
};
