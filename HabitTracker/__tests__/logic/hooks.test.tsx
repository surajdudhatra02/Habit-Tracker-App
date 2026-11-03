import React, { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { Alert, Platform } from 'react-native';
import {
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { useFCMToken } from '../../src/hooks/useFCMToken';
import { useHabitCompletionRange } from '../../src/hooks/useHabitCompletionRange';
import { useNotificationPermission } from '../../src/hooks/useNotificationPermission';
import { memoryBackend } from './memoryBackend';

jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 31 },
  Alert: { alert: jest.fn() },
  AppState: {
    addEventListener: (_event: string, listener: (state: string) => void) => {
      mockAppStateListener = listener;
      return { remove: jest.fn() };
    },
  },
}));
jest.mock('../../src/store/useHabitStore', () => ({
  useHabitStore: {
    getState: () => ({
      userId: mockReminderUserId,
      rescheduleAllReminders: mockRescheduleReminders,
    }),
  },
}));
jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(),
  onTokenRefresh: jest.fn(),
  requestPermission: jest.fn(),
}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  // Only real Notifee APIs are provided. isAlarmPermissionGranted does not exist
  // in the installed package; alarm status is in NotificationSettings.android.
  default: {
    requestPermission: jest.fn(),
    getNotificationSettings: jest.fn(),
    openAlarmPermissionSettings: jest.fn(),
  },
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
  AndroidNotificationSetting: { DISABLED: 0, ENABLED: 1 },
}));
jest.mock('../../src/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));
jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/utils/toast', () => ({ showErrorToast: jest.fn() }));

let renderer: TestRenderer.ReactTestRenderer | undefined;
let mockAppStateListener: (state: string) => void;
let mockReminderUserId: string | null = 'alice';
const mockRescheduleReminders = jest.fn();
let errorLog: jest.SpyInstance;
let backend: ReturnType<typeof memoryBackend>;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  jest.resetAllMocks();
  Object.assign(Platform, { OS: 'android', Version: 31 });
  mockReminderUserId = 'alice';
  mockRescheduleReminders.mockResolvedValue(undefined);
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  backend = memoryBackend();
  (supabase.from as jest.Mock).mockImplementation(backend.from);
  (useAuth as jest.Mock).mockReturnValue({ user: { id: 'alice' } });
  (requestPermission as jest.Mock).mockResolvedValue(1);
  (getToken as jest.Mock).mockResolvedValue('this-device-token');
  (onTokenRefresh as jest.Mock).mockReturnValue(jest.fn());
  (supabase.rpc as jest.Mock).mockResolvedValue({ data: [], error: null });
  (notifee.requestPermission as jest.Mock).mockResolvedValue({
    authorizationStatus: 1,
    android: { alarm: 0 },
  });
  (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
    authorizationStatus: 1,
    android: { alarm: 0 },
  });
});

afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
  errorLog.mockRestore();
});

const TokenProbe = ({ userId }: { userId: string | null }) => {
  useFCMToken(userId);
  return null;
};

test('control: first login saves the device token and subscribes to refresh', async () => {
  await act(async () => {
    renderer = TestRenderer.create(<TokenProbe userId="alice" />);
  });
  expect(backend.tables.device_tokens[0]).toMatchObject({
    user_id: 'alice',
    token: 'this-device-token',
  });
  expect(onTokenRefresh).toHaveBeenCalledTimes(1);
});

test('logging out and logging into another account registers the new account token', async () => {
  await act(async () => {
    renderer = TestRenderer.create(<TokenProbe userId="alice" />);
  });
  await act(async () => {
    renderer!.update(<TokenProbe userId={null} />);
  });
  await act(async () => {
    renderer!.update(<TokenProbe userId="bob" />);
  });
  expect(backend.tables.device_tokens.some(row => row.user_id === 'bob')).toBe(
    true,
  );
});

test('logging back into the same account restores the token-refresh subscription', async () => {
  const unsubscribe = jest.fn();
  (onTokenRefresh as jest.Mock).mockReturnValue(unsubscribe);
  await act(async () => {
    renderer = TestRenderer.create(<TokenProbe userId="alice" />);
  });
  await act(async () => {
    renderer!.update(<TokenProbe userId={null} />);
  });
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  await act(async () => {
    renderer!.update(<TokenProbe userId="alice" />);
  });
  expect(onTokenRefresh).toHaveBeenCalledTimes(2);
});

test('registering a second Android device preserves the first device token', async () => {
  backend.tables.device_tokens = [
    { user_id: 'alice', token: 'other-android-device', platform: 'android' },
  ];
  await act(async () => {
    renderer = TestRenderer.create(<TokenProbe userId="alice" />);
  });
  expect(
    backend.tables.device_tokens.some(
      row => row.token === 'other-android-device',
    ),
  ).toBe(true);
});

test('a token request completing after logout does not register the previous account', async () => {
  let finish!: (token: string) => void;
  (getToken as jest.Mock).mockReturnValueOnce(
    new Promise<string>(resolve => {
      finish = resolve;
    }),
  );
  await act(async () => {
    renderer = TestRenderer.create(<TokenProbe userId="alice" />);
  });
  await act(async () => {
    renderer!.update(<TokenProbe userId={null} />);
  });
  await act(async () => {
    finish('late-token');
  });
  expect(backend.tables.device_tokens ?? []).toEqual([]);
});

test('token refresh upserts only the active device registration', async () => {
  await act(async () => {
    renderer = TestRenderer.create(<TokenProbe userId="alice" />);
  });
  const refresh = (onTokenRefresh as jest.Mock).mock.calls[0][1];
  await act(async () => {
    refresh('this-device-token');
  });
  expect(backend.tables.device_tokens).toHaveLength(1);
});

test('an obsolete progress request cannot replace the selected range', async () => {
  let finish!: (value: any) => void;
  (supabase.rpc as jest.Mock).mockReturnValueOnce(
    new Promise(resolve => {
      finish = resolve;
    }),
  );
  await act(async () => {
    renderer = TestRenderer.create(
      <RangeProbe start={new Date(2026, 9, 1)} end={new Date(2026, 9, 31)} />,
    );
  });
  await act(async () => {
    renderer!.update(
      <RangeProbe start={new Date(2026, 10, 1)} end={new Date(2026, 10, 30)} />,
    );
  });
  await act(async () => {
    finish({ data: [{ completion_rate: 100 }], error: null });
  });
  expect(completion.data).toEqual([]);
  expect(completion.averageRate).toBe(0);
});

let completion: ReturnType<typeof useHabitCompletionRange>;
const RangeProbe = ({ start, end }: { start: Date; end: Date }) => {
  completion = useHabitCompletionRange({ startDate: start, endDate: end });
  return null;
};

test('monthly queries retain the first and last local calendar dates', async () => {
  const start = new Date(2026, 10, 1);
  const end = new Date(2026, 10, 30);
  await act(async () => {
    renderer = TestRenderer.create(<RangeProbe start={start} end={end} />);
  });
  expect(supabase.rpc).toHaveBeenCalledWith('get_habit_completion_by_range', {
    p_user_id: 'alice',
    p_start_date: '2026-11-01',
    p_end_date: '2026-11-30',
    p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
});

test('an empty progress response clears previously displayed success and trend', async () => {
  (supabase.rpc as jest.Mock).mockResolvedValueOnce({
    data: [{ completion_rate: 0 }, { completion_rate: 100 }],
    error: null,
  });
  const start = new Date(2026, 10, 1);
  const end = new Date(2026, 10, 2);
  await act(async () => {
    renderer = TestRenderer.create(<RangeProbe start={start} end={end} />);
  });
  expect(completion.averageRate).toBe(50);
  expect(completion.trend).toBe(100);
  await act(async () => {
    await completion.refetch();
  });
  expect(completion.data).toEqual([]);
  expect({
    averageRate: completion.averageRate,
    trend: completion.trend,
  }).toEqual({ averageRate: 0, trend: 0 });
});

test('a missing backend function keeps the last successful progress and logs a readable error', async () => {
  const days = [{ completion_rate: 100 }];
  (supabase.rpc as jest.Mock).mockResolvedValueOnce({
    data: days,
    error: null,
  });
  await act(async () => {
    renderer = TestRenderer.create(
      <RangeProbe start={new Date(2026, 10, 1)} end={new Date(2026, 10, 2)} />,
    );
  });
  const failure = {
    code: 'PGRST202',
    message:
      'Could not find public.get_habit_completion_by_range with p_timezone',
    hint: 'Reload the schema cache after creating the function',
  };
  (supabase.rpc as jest.Mock).mockResolvedValueOnce({
    data: null,
    error: failure,
  });
  await act(async () => {
    await completion.refetch();
  });
  expect(completion.data).toEqual(days);
  expect(completion.averageRate).toBe(100);
  expect(completion.loading).toBe(false);
  expect(completion.error).toEqual(failure);
  expect(errorLog).toHaveBeenCalledWith(
    expect.stringContaining('"code":"PGRST202"'),
  );
  expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('p_timezone'));
});

test.each([31, 33, 36])(
  'disabled exact alarms on Android API %s offer user-approved reminders',
  async version => {
    Object.assign(Platform, { Version: version });
    const PermissionProbe = () => {
      useNotificationPermission('alice');
      return null;
    };
    await act(async () => {
      renderer = TestRenderer.create(<PermissionProbe />);
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      'Enable Exact Reminders',
      expect.stringContaining('Android may delay your reminders'),
      expect.any(Array),
    );
  },
);

const ReminderPermissionProbe = () => {
  useNotificationPermission('alice');
  return null;
};

test('returning after granting alarm access upgrades reminder schedules once', async () => {
  await act(async () => {
    renderer = TestRenderer.create(<ReminderPermissionProbe />);
  });
  (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
    android: { alarm: 1 },
  });
  await act(async () => {
    mockAppStateListener('active');
  });
  expect(mockRescheduleReminders).toHaveBeenCalledTimes(1);
  await act(async () => {
    mockAppStateListener('active');
  });
  expect(mockRescheduleReminders).toHaveBeenCalledTimes(1);
  expect(Alert.alert).toHaveBeenCalledTimes(1);
});

test('declining alarm access keeps the app usable without rescheduling or repeated prompts', async () => {
  await act(async () => {
    renderer = TestRenderer.create(<ReminderPermissionProbe />);
  });
  await act(async () => {
    mockAppStateListener('active');
  });
  expect(mockRescheduleReminders).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledTimes(1);
});

test('a settings return cannot restore reminders for a different signed-in account', async () => {
  await act(async () => {
    renderer = TestRenderer.create(<ReminderPermissionProbe />);
  });
  mockReminderUserId = 'bob';
  (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
    android: { alarm: 1 },
  });
  await act(async () => {
    mockAppStateListener('active');
  });
  expect(mockRescheduleReminders).not.toHaveBeenCalled();
});
