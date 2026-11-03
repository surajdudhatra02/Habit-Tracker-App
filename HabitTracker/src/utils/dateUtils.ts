/** Date-only database values follow the device's local calendar, not UTC. */
export const getLocalDateString = (date = new Date()): string => {
  if (Number.isNaN(date.getTime()))
    throw new RangeError('Invalid calendar date');
  return [
    date.getFullYear().toString().padStart(4, '0'),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('-');
};

export const getLocalTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getDateRange = (
  daysToSubtract: number,
  reference = new Date(),
) => {
  const end = new Date(reference);
  const start = new Date(reference);
  start.setDate(end.getDate() - daysToSubtract);
  return { startDate: start, endDate: end };
};
