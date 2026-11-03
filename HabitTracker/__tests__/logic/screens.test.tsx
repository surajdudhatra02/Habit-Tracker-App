import React, { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { supabase } from '../../src/lib/supabase';
import { useHabitStore } from '../../src/store/useHabitStore';
import { useAuth } from '../../src/hooks/useAuth';
import NewHabitScreen from '../../src/screens/NewHabitScreen';
import ProgressScreen from '../../src/screens/ProgressScreen';
import { memoryBackend } from './memoryBackend';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: { create: (styles: unknown) => styles },
  AppState: { addEventListener: () => ({ remove: () => {} }) },
}));
// Animation is a native boundary; these tests exercise screen behavior.
jest.mock('../../src/components/MotionView', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../../src/components/Skeleton', () => ({
  SkeletonBlock: 'SkeletonBlock',
  HabitListSkeleton: 'HabitListSkeleton',
  TrendChartSkeleton: 'TrendChartSkeleton',
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-native-vector-icons/material-design-icons', () => ({
  __esModule: true,
  default: 'Icon',
  MaterialDesignIcons: 'Icon',
}));
jest.mock('../../src/components', () => ({
  Button: 'Button',
  Divider: 'Divider',
  Input: 'Input',
  TimePicker: 'TimePicker',
  CalendarComponent: 'CalendarComponent',
  ProgressCurveChart: 'ProgressCurveChart',
}));
jest.mock('../../src/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));
jest.mock('../../src/utils/ids', () => ({
  newHabitId: () => 'new-habit-request',
}));
jest.mock('../../src/lib/notifee', () => ({
  cancelAllHabitReminders: jest.fn(),
  cancelHabitReminders: jest.fn(),
  scheduleAllRemindersForHabit: jest.fn(),
}));
jest.mock('../../src/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/hooks', () =>
  jest.requireActual('../../src/hooks/useHabitCompletionRange'),
);
jest.mock('../../src/utils', () =>
  jest.requireActual('../../src/utils/dateUtils'),
);
jest.mock('../../src/utils/toast', () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => any) => {
    const react = require('react');
    react.useEffect(() => {
      callback();
      mockFocusCallbacks.add(callback);
      return () => {
        mockFocusCallbacks.delete(callback);
      };
    }, [callback]);
  },
}));

const mockFocusCallbacks = new Set<() => any>();
const habit = {
  id: 'habit-a',
  user_id: 'alice',
  name: 'Read',
  description: 'Old description',
  goal: 'Old goal',
};
let renderer: TestRenderer.ReactTestRenderer;
let backend: ReturnType<typeof memoryBackend>;
let errorLog: jest.SpyInstance;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  jest.resetAllMocks();
  mockFocusCallbacks.clear();
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  backend = memoryBackend({
    habits: [habit],
    habit_reminders: [
      {
        id: 'r1',
        habit_id: 'habit-a',
        reminder_time: '09:00:00',
        is_enabled: true,
      },
    ],
  });
  (supabase.from as jest.Mock).mockImplementation(backend.from);
  (supabase.rpc as jest.Mock).mockImplementation(backend.rpc);
  (useAuth as jest.Mock).mockReturnValue({ user: { id: 'alice' } });
  useHabitStore.setState({
    habits: [habit] as any,
    userId: 'alice',
    loading: false,
  });
});

afterEach(async () => {
  if (renderer)
    await act(async () => {
      renderer.unmount();
    });
  errorLog.mockRestore();
});

const mountEditor = async () => {
  await act(async () => {
    renderer = TestRenderer.create(
      <NewHabitScreen
        route={{ params: { habit }, key: 'edit', name: 'NewHabit' } as any}
        navigation={{ setOptions: jest.fn(), goBack: jest.fn() } as any}
      />,
    );
  });
};

const saveEditor = async () => {
  const saveButton = renderer.root
    .findAllByType('Button' as any)
    .find(node => node.props.text === 'Update Habit')!;
  await act(async () => {
    saveButton.props.onPress();
  });
};

test('control: editing a habit name persists the changed name', async () => {
  await mountEditor();
  const name = renderer.root.findAllByType('Input' as any)[0];
  await act(async () => {
    name.props.onChangeText('Read daily');
  });
  await saveEditor();
  expect(backend.tables.habits[0].name).toBe('Read daily');
});

test.each([
  ['description', 1],
  ['goal', 2],
])(
  'clearing %s in the editor persists an empty value after reload',
  async (field, index) => {
    await mountEditor();
    const input = renderer.root.findAllByType('Input' as any)[index as number];
    await act(async () => {
      input.props.onChangeText('');
    });
    await saveEditor();
    expect(backend.tables.habits[0][field] ?? '').toBe('');
  },
);

test('returning to the mounted Progress tab refreshes newly completed habits', async () => {
  let rate = 0;
  (supabase.rpc as jest.Mock).mockImplementation(async () => ({
    data: [
      {
        day_date: '2026-11-03',
        day_label: 'Tue',
        total_habits: 1,
        completed_habits: rate / 100,
        completion_rate: rate,
      },
    ],
    error: null,
  }));
  await act(async () => {
    renderer = TestRenderer.create(<ProgressScreen />);
  });
  const chartData = () =>
    renderer.root.findByType('ProgressCurveChart' as any).props.data;
  expect(chartData()[0].completion_rate).toBe(0);
  // Bottom tabs retain their mounted screen when another screen is visited.
  // Model a completed check-in followed by a navigation focus event.
  rate = 100;
  await act(async () => {
    mockFocusCallbacks.forEach(callback => callback());
    renderer.update(<ProgressScreen />);
  });
  expect(chartData()[0].completion_rate).toBe(100);
});
