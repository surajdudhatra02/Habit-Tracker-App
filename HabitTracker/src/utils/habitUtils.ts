// src/utils/habitUtils.ts

export const ICON_NAMES = [
  'run-fast',
  'book-open-variant',
  'water',
  'dumbbell',
  'meditation',
  'food-apple',
  'sleep',
  'bicycle',
  'music',
  'pencil',
];

export const getHabitIcon = (name: string) => {
  const idx =
    name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    ICON_NAMES.length;
  return ICON_NAMES[idx];
};

export const daysSince = (dateString: string) => {
  const created = new Date(dateString);
  const now = new Date();
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
  );
};

export const formatDate = (dateString: string, short = false) => {
  const date = new Date(dateString);
  return short
    ? date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
};

export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${minutes} ${period}`;
};
