import React, { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { Linking, Platform, Share } from 'react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';
import { showErrorToast } from '../../src/utils/toast';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Platform: { OS: 'android' },
  Share: { share: jest.fn() },
  Linking: { openURL: jest.fn() },
}));
// Animation is a native boundary; these tests exercise screen behavior.
jest.mock('../../src/components/MotionView', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-native-vector-icons/material-design-icons', () => ({
  __esModule: true,
  default: 'Icon',
}));
jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBuildNumber: () => '42',
}));
jest.mock('../../src/components/BrandLogo', () => ({
  __esModule: true,
  default: 'BrandLogo',
}));
jest.mock('../../src/components', () => ({
  Button: 'Button',
  Divider: 'Divider',
}));
jest.mock('../../src/hooks', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' }, logout: () => {} }),
  useAppUpdate: () => ({ status: 'normal' }),
}));
jest.mock('../../src/navigation/route', () => ({
  Routes: { ProfileInfo: 'ProfileInfo' },
}));
jest.mock('../../src/utils/toast', () => ({
  showErrorToast: jest.fn(),
  showInfoToast: jest.fn(),
}));

const listing =
  'https://play.google.com/store/apps/details?id=com.suraj.habitz';
const market = 'market://details?id=com.suraj.habitz';
let renderer: TestRenderer.ReactTestRenderer;
let errorLog: jest.SpyInstance;

beforeEach(async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  jest.resetAllMocks();
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: 'android',
  });
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  (Share.share as jest.Mock).mockResolvedValue({ action: 'sharedAction' });
  (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
  await act(async () => {
    renderer = TestRenderer.create(
      <SettingsScreen navigation={{ navigate: jest.fn() }} />,
    );
  });
});

afterEach(async () => {
  await act(async () => {
    renderer.unmount();
  });
  errorLog.mockRestore();
});

const press = async (label: string) => {
  const button = renderer.root.findByProps({ accessibilityLabel: label });
  await act(async () => {
    await button.props.onPress();
  });
};

test('Share App opens the native share sheet with the public listing URL', async () => {
  await press('Share Habitz');
  expect(Share.share).toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringContaining(listing) }),
    expect.any(Object),
  );
  expect(Linking.openURL).not.toHaveBeenCalled();
});

test('dismissing the share sheet is not reported as an error', async () => {
  (Share.share as jest.Mock).mockResolvedValueOnce({
    action: 'dismissedAction',
  });
  await press('Share Habitz');
  expect(showErrorToast).not.toHaveBeenCalled();
});

test('share failures are handled without an unhandled rejection', async () => {
  (Share.share as jest.Mock).mockRejectedValueOnce(
    new Error('Share unavailable'),
  );
  await press('Share Habitz');
  expect(showErrorToast).toHaveBeenCalledWith(
    'Unable to share app',
    expect.any(String),
  );
});

test('Rate App opens the Android Play Store listing', async () => {
  await press('Rate Habitz');
  expect(Linking.openURL).toHaveBeenCalledWith(market);
  expect(Linking.openURL).toHaveBeenCalledTimes(1);
});

test('Rate App falls back to the web listing when no native store is available', async () => {
  (Linking.openURL as jest.Mock).mockRejectedValueOnce(
    new Error('No Play Store installed'),
  );
  await press('Rate Habitz');
  expect(Linking.openURL).toHaveBeenNthCalledWith(1, market);
  expect(Linking.openURL).toHaveBeenNthCalledWith(2, listing);
  expect(showErrorToast).not.toHaveBeenCalled();
});

test('non-Android devices use the supplied web listing', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  await press('Rate Habitz');
  expect(Linking.openURL).toHaveBeenCalledWith(listing);
  expect(Linking.openURL).toHaveBeenCalledTimes(1);
});

test('Rate App reports failure if neither the store nor browser can open', async () => {
  (Linking.openURL as jest.Mock).mockRejectedValue(
    new Error('Link handlers unavailable'),
  );
  await press('Rate Habitz');
  expect(showErrorToast).toHaveBeenCalledWith(
    'Unable to open store',
    expect.any(String),
  );
});
