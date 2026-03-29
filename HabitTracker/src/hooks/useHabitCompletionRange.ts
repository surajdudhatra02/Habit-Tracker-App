import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { showErrorToast } from '../utils/toast';

export interface CompletionDay {
  day_date: string; // "2026-03-23"
  day_label: string; // "Mon"
  total_habits: number;
  completed_habits: number;
  completion_rate: number; // 0–100
}

interface UseHabitCompletionRangeOptions {
  startDate: Date;
  endDate: Date;
}

const toDateString = (d: Date) => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export const useHabitCompletionRange = ({
  startDate,
  endDate,
}: UseHabitCompletionRangeOptions) => {
  const { user } = useAuth();
  const [data, setData] = useState<CompletionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRate, setAverageRate] = useState(0);
  const [trend, setTrend] = useState(0); // positive = improving, negative = declining

  const startStr = toDateString(startDate);
  const endStr = toDateString(endDate);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc(
        'get_habit_completion_by_range',
        {
          p_user_id: user.id,
          p_start_date: startStr,
          p_end_date: endStr,
        },
      );
      if (error) throw error;

      setData(result || []);

      if (result && result.length > 0) {
        // Average across all days in range
        const avg =
          result.reduce(
            (sum: number, d: CompletionDay) => sum + d.completion_rate,
            0,
          ) / result.length;
        setAverageRate(Math.round(avg));

        // Trend: second half avg vs first half avg
        const mid = Math.floor(result.length / 2);
        const firstHalf = result.slice(0, mid);
        const secondHalf = result.slice(mid);
        const firstAvg =
          firstHalf.reduce(
            (s: number, d: CompletionDay) => s + d.completion_rate,
            0,
          ) / (firstHalf.length || 1);
        const secondAvg =
          secondHalf.reduce(
            (s: number, d: CompletionDay) => s + d.completion_rate,
            0,
          ) / (secondHalf.length || 1);
        setTrend(Math.round(secondAvg - firstAvg));
      }
    } catch (err: any) {
      console.error('Error fetching habit completion range:', err.message);
      showErrorToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, startStr, endStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, averageRate, trend, loading, refetch: fetchData };
};
