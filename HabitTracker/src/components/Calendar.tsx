import { Calendar } from 'react-native-calendars';

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
        monthTextColor: '#a5c9a7',
        textMonthFontWeight: 'semibold',
        arrowColor: '#373738',
        dayTextColor: '#dddddd',
        selectedDayTextColor: '#141414',
        selectedDayBackgroundColor: '#a5c9a7',
        todayTextColor: '#a5c9a7',
      }}
    />
  );
};

export default CalendarComponent;
