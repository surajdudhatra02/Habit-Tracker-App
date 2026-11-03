import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { getLocalDateString, getLocalTimeZone } from '../utils/dateUtils';
import { showErrorToast } from '../utils/toast';

export interface CompletionDay {
  day_date: string;
  day_label: string;
  total_habits: number;
  completed_habits: number;
  completion_rate: number;
}

interface UseHabitCompletionRangeOptions {
  startDate: Date;
  endDate: Date;
  autoFetch?: boolean;
}

const EMPTY_DAYS: CompletionDay[] = [];

export const useHabitCompletionRange = ({
  startDate,
  endDate,
  autoFetch = true,
}: UseHabitCompletionRangeOptions) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const startStr = getLocalDateString(startDate);
  const endStr = getLocalDateString(endDate);
  const timezone = getLocalTimeZone();
  const scope = `${userId}:${startStr}:${endStr}:${timezone}`;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const requestRef = useRef(0);
  const mounted = useRef(true);
  const [result, setResult] = useState<{
    scope: string;
    data: CompletionDay[];
    loading: boolean;
    error: unknown;
  }>({ scope, data: EMPTY_DAYS, loading: !!userId, error: null });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    const request = ++requestRef.current;
    const isCurrent = () =>
      mounted.current &&
      scopeRef.current === scope &&
      requestRef.current === request;
    if (!userId) {
      setResult({ scope, data: EMPTY_DAYS, loading: false, error: null });
      return;
    }
    setResult(previous => ({
      scope,
      data: previous.scope === scope ? previous.data : EMPTY_DAYS,
      loading: true,
      error: null,
    }));
    try {
      const { data, error } = await supabase.rpc(
        'get_habit_completion_by_range',
        {
          p_user_id: userId,
          p_start_date: startStr,
          p_end_date: endStr,
          p_timezone: timezone,
        },
      );
      if (error) throw error;
      if (isCurrent())
        setResult({
          scope,
          data: data || EMPTY_DAYS,
          loading: false,
          error: null,
        });
    } catch (error) {
      if (!isCurrent()) return;
      setResult(previous => ({ ...previous, loading: false, error }));
      showErrorToast('Unable to load progress', 'Please try again.');
      console.error('Error fetching habit completion range:', error);
    }
  }, [userId, startStr, endStr, scope, timezone]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [fetchData, autoFetch]);

  // Scope the visible data too: a new account must never briefly render the
  // previous account's result while its effect starts loading.
  const data = result.scope === scope ? result.data : EMPTY_DAYS;
  const { averageRate, trend } = useMemo(() => {
    if (!data.length) return { averageRate: 0, trend: 0 };
    const average = (days: CompletionDay[]) =>
      days.reduce((sum, day) => sum + day.completion_rate, 0) / days.length;
    const middle = Math.floor(data.length / 2);
    return {
      averageRate: Math.round(average(data)),
      trend:
        data.length < 2
          ? 0
          : Math.round(
              average(data.slice(middle)) - average(data.slice(0, middle)),
            ),
    };
  }, [data]);

  return {
    data,
    averageRate,
    trend,
    loading: !!userId && (result.scope !== scope || result.loading),
    error: result.scope === scope ? result.error : null,
    refetch: fetchData,
  };
};
