import React, { useContext } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AuthContext, AuthProvider } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));
jest.mock('../../src/hooks', () => ({
  useDeepLink: jest.fn(),
  useFCMToken: jest.fn(),
  useNotificationPermission: jest.fn(),
}));
jest.mock('../../src/store', () => ({
  useHabitStore: { getState: () => ({ setUserId: async () => {} }) },
}));
jest.mock('../../src/utils/toast', () => ({ showErrorToast: jest.fn() }));

let auth: React.ContextType<typeof AuthContext>;
let event: (name: string, session: any) => void;
let renderer: TestRenderer.ReactTestRenderer;
let errorLog: jest.SpyInstance;
const Probe = () => {
  auth = useContext(AuthContext);
  return null;
};
const alice = { user: { id: 'alice' } };

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  jest.resetAllMocks();
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: null },
    error: null,
  });
  (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
    callback => {
      event = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    },
  );
});
afterEach(async () => {
  if (renderer)
    await act(async () => {
      renderer.unmount();
    });
  errorLog.mockRestore();
});
const mount = async () => {
  await act(async () => {
    renderer = TestRenderer.create(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
  });
};

test('late session restoration cannot undo a newer sign-out event', async () => {
  let finish!: (value: any) => void;
  (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
    new Promise(resolve => {
      finish = resolve;
    }),
  );
  await mount();
  await act(async () => {
    event('SIGNED_OUT', null);
  });
  await act(async () => {
    finish({ data: { session: alice }, error: null });
  });
  expect(auth.user).toBeNull();
  expect(auth.loading).toBe(false);
});

test('failed session restoration exits the loading screen', async () => {
  (supabase.auth.getSession as jest.Mock).mockRejectedValueOnce(
    new Error('Storage unavailable'),
  );
  await mount();
  expect(auth.loading).toBe(false);
  expect(auth.session).toBeNull();
});

test('sign-out clears recovery state so a later login can enter the app', async () => {
  await mount();
  await act(async () => {
    event('PASSWORD_RECOVERY', alice);
  });
  expect(auth.isPasswordRecovery).toBe(true);
  await act(async () => {
    event('SIGNED_OUT', null);
  });
  await act(async () => {
    event('SIGNED_IN', alice);
  });
  expect(auth.isPasswordRecovery).toBe(false);
  expect(auth.user?.id).toBe('alice');
});
