/**
 * @format
 */

import React, { act } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { useAppUpdate, useForegroundNotification } from '../src/hooks';
import { createNotificationChannel } from '../src/lib/notifee';

// Native boundaries are mocked; this verifies app composition and update
// blocking behavior. OS-level integration still requires device verification.
jest.mock('react-native', () => ({ StatusBar: 'StatusBar' }));
jest.mock('react-native-get-random-values', () => ({}));
jest.mock('react-native-url-polyfill/auto', () => ({}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: 'NavigationContainer',
  DarkTheme: { dark: true, colors: {} },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'SafeAreaProvider',
}));
jest.mock('../src/context', () => ({ AuthProvider: 'AuthProvider' }));
jest.mock('../src/navigation/RootNavigator', () => 'RootNavigator');
jest.mock('react-native-toast-message', () => 'Toast');
jest.mock('../src/utils', () => ({ toastConfig: {} }));
jest.mock('../src/hooks', () => ({
  useAppUpdate: jest.fn(),
  useForegroundNotification: jest.fn(),
}));
jest.mock('../src/components', () => ({ BlockingScreen: 'BlockingScreen' }));
jest.mock('../src/lib/notifee', () => ({
  createNotificationChannel: jest.fn(),
}));

let renderer: ReactTestRenderer.ReactTestRenderer;
let errorLog: jest.SpyInstance;
beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  jest.resetAllMocks();
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  (createNotificationChannel as jest.Mock).mockResolvedValue(undefined);
});
afterEach(async () => {
  if (renderer)
    await act(async () => {
      renderer.unmount();
    });
  errorLog.mockRestore();
});

test.each([
  ['normal', false],
  ['soft', false],
  ['hard', true],
  ['maintenance', true],
])(
  'app mounts and blocks interaction only for %s when appropriate',
  async (status, visible) => {
    (useAppUpdate as jest.Mock).mockReturnValue({
      status,
      message: 'Update status',
    });
    await act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    expect(renderer.root.findAllByType('RootNavigator' as any)).toHaveLength(1);
    expect(
      renderer.root.findByType('BlockingScreen' as any).props.visible,
    ).toBe(visible);
    expect(useForegroundNotification).toHaveBeenCalled();
    expect(createNotificationChannel).toHaveBeenCalledTimes(1);
  },
);
