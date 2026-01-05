import { Calendar } from 'react-native-calendars';
import { colors } from '../constants';

const CalendarComponent = () => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

  return (
    <Calendar
      maxDate={formattedToday}
      markedDates={{
        '2025-11-20': { selected: true },
        '2025-11-25': { selected: true },
      }}
      hideExtraDays
      theme={{
        calendarBackground: 'transparent',
        monthTextColor: colors.light_green,
        textMonthFontWeight: 'semibold',
        arrowColor: colors.light_grey,
        dayTextColor: colors.off_white,
        selectedDayTextColor: colors.dark_bg,
        selectedDayBackgroundColor: colors.light_green,
        todayTextColor: colors.light_green,
      }}
    />
  );
};

export default CalendarComponent;
