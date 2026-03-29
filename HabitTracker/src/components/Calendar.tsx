import { Calendar, DateData } from 'react-native-calendars';
import { colors } from '../constants';

interface MarkedDate {
  selected?: boolean;
  selectedColor?: string;
  dotColor?: string;
  marked?: boolean;
}

interface CalendarComponentProps {
  markedDates?: Record<string, MarkedDate>;
  onMonthChange?: (month: DateData) => void;
}

const CalendarComponent = ({
  markedDates = {},
  onMonthChange,
}: CalendarComponentProps) => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  return (
    <Calendar
      maxDate={formattedToday}
      markedDates={markedDates}
      markingType="dot"
      onMonthChange={onMonthChange}
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
        dotColor: colors.light_green,
      }}
    />
  );
};

export default CalendarComponent;
