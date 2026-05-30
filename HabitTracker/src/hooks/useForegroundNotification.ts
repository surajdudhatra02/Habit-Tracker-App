import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { displayFromRemoteMessage } from '../lib/notifee';

export const useForegroundNotification = () => {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      await displayFromRemoteMessage(remoteMessage);
    });
    return unsubscribe;
  }, []);
};
