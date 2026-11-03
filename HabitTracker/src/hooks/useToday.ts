import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const localMidnight = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Update open screens at midnight and after backgrounding or a timezone change. */
export const useToday = () => {
  const [today, setToday] = useState(localMidnight);
  useEffect(() => {
    const refresh = () => {
      const next = localMidnight();
      setToday(current =>
        current.getTime() === next.getTime() ? current : next,
      );
    };
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const timer = setTimeout(refresh, midnight.getTime() - now.getTime());
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [today]);
  return today;
};
