import { Calendar, DateData } from 'react-native-calendars';
import React from 'react';
import { colors } from '../constants';
import { getLocalDateString } from '../utils/dateUtils';
import { useToday } from '../hooks/useToday';

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
  const formattedToday = getLocalDateString(useToday());

  return (
    <Calendar
      maxDate={formattedToday}
      firstDay={1}
      enableSwipeMonths
      markedDates={markedDates}
      markingType="dot"
      onMonthChange={onMonthChange}
      hideExtraDays
      theme={{
        calendarBackground: 'transparent',
        monthTextColor: colors.light_green,
        textMonthFontWeight: '700',
        textMonthFontSize: 15,
        textDayFontSize: 13,
        textDayHeaderFontSize: 10,
        textDayHeaderFontWeight: '600',
        textSectionTitleColor: colors.grey_text,
        textDisabledColor: colors.divider_grey,
        arrowColor: colors.off_white,
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
