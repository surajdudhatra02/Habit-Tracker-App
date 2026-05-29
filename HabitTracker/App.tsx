import React from 'react';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils';
import { useAppUpdate } from './src/hooks';
import { BlockingScreen } from './src/components';

function App() {
  const { status, message, url } = useAppUpdate();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
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
