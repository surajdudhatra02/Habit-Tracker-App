import React, { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { getDateRange, getLocalDateString } from '../../src/utils/dateUtils';
import { useToday } from '../../src/hooks/useToday';

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: (_: string, callback: (state: string) => void) => {
      mockResume = callback;
      return { remove: () => {} };
    },
  },
}));
let mockResume: (state: string) => void;
let renderer: TestRenderer.ReactTestRenderer | undefined;
let today: Date;
const Probe = () => {
  today = useToday();
  return null;
};
let errorLog: jest.SpyInstance;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.useFakeTimers();
});
afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
  jest.useRealTimers();
  errorLog.mockRestore();
});

test.each([
  [2026, 0, 1, '2026-01-01'],
  [2026, 10, 3, '2026-11-03'],
  [2024, 1, 29, '2024-02-29'],
])('local date formatter preserves %s/%s/%s', (year, month, day, expected) => {
  expect(
    getLocalDateString(
      new Date(year as number, month as number, day as number, 0, 30),
    ),
  ).toBe(expected);
});
test('invalid dates are rejected instead of sent to the database', () => {
  expect(() => getLocalDateString(new Date('invalid'))).toThrow(RangeError);
});
test('date ranges cross DST using calendar arithmetic', () => {
  const { startDate, endDate } = getDateRange(6, new Date(2026, 10, 3));
  expect(getLocalDateString(startDate)).toBe('2026-10-28');
  expect(getLocalDateString(endDate)).toBe('2026-11-03');
});
test('an open screen advances its day at local midnight', async () => {
  jest.setSystemTime(new Date(2026, 10, 3, 23, 59, 59));
  await act(async () => {
    renderer = TestRenderer.create(<Probe />);
  });
  expect(getLocalDateString(today)).toBe('2026-11-03');
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(getLocalDateString(today)).toBe('2026-11-04');
});
test('foregrounding after several days refreshes the local day', async () => {
  jest.setSystemTime(new Date(2026, 10, 3, 12));
  await act(async () => {
    renderer = TestRenderer.create(<Probe />);
  });
  jest.setSystemTime(new Date(2026, 10, 6, 12));
  await act(async () => {
    mockResume('active');
  });
  expect(getLocalDateString(today)).toBe('2026-11-06');
});
