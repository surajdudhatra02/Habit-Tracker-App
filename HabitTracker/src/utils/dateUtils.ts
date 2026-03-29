export const getDateRange = (daysToSubtract: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysToSubtract);
  return { startDate: start, endDate: end };
};
