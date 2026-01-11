import { View, Text, Platform, Pressable, Modal } from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../constants';
import Button from './Button';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  onDismiss?: () => void;
};

const TimePicker = ({ value, onChange, onDismiss }: Props) => {
  const [tempTime, setTempTime] = useState<Date>(value);

  const handleChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedTime) {
        onChange(selectedTime);
      }
      onDismiss?.();
    } else if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const handleConfirm = () => {
    onChange(tempTime);
    onDismiss?.();
  };

  const handleCancel = () => {
    onDismiss?.();
  };

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="time"
        is24Hour={false}
        display="default"
        onChange={handleChange}
      />
    );
  }

  return (
    <Modal transparent animationType="slide" visible={true}>
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={handleCancel}
      >
        <Pressable
          className="bg-dark_grey rounded-t-3xl"
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-light_grey">
            <Button
              onPress={handleCancel}
              text="Cancel"
              className="py-2"
              textClassName="text-off_white text-base"
            />
            <Text className="text-off_white text-lg font-semibold">
              Select Time
            </Text>
            <Button
              onPress={handleConfirm}
              text="Done"
              className="py-2"
              textClassName="text-light_green text-base font-semibold"
            ></Button>
          </View>

          {/* Time Picker */}
          <View className="pb-6">
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleChange}
              textColor={colors.off_white}
              themeVariant="dark"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default TimePicker;
