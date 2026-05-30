import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { displayFromRemoteMessage } from './notifee';

export const registerBackgroundHandlers = (): void => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    if (remoteMessage.notification) {
      return;
    }
    // Data-only message — display with Notifee
    await displayFromRemoteMessage(remoteMessage);
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log(
        '[Notifee] Background notification tapped:',
        detail.notification?.id,
      );
    }
  });
};
