import React, { useEffect } from 'react';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils';
import { useAppUpdate, useForegroundNotification } from './src/hooks';
import { BlockingScreen } from './src/components';
import { createNotificationChannel } from './src/lib/notifee';
import { colors } from './src/constants';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.light_green,
    background: colors.dark_bg,
    card: colors.dark_bg,
    text: colors.white,
    border: colors.card_border,
  },
};

function App() {
  const { status, message, url } = useAppUpdate();

  useForegroundNotification();

  useEffect(() => {
    createNotificationChannel();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark_bg} />
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
      <Toast config={toastConfig} />

      {/* Renders full screen and blocks interaction for hard updates or maintenance */}
      <BlockingScreen
        visible={status === 'hard' || status === 'maintenance'}
        type={status as 'hard' | 'maintenance'}
        message={message || ''}
        url={url}
      />
    </SafeAreaProvider>
  );
}

export default App;
