import { View, Text } from 'react-native';
import React from 'react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import CustomCheckbox from './CustomCheckbox';

interface ReminderItemProps {
  icon: string;
  label: string;
  time: string;
  checked: boolean;
  onValueChange: (value: boolean) => void;
}

const CheckboxCard: React.FC<ReminderItemProps> = ({
  icon,
  label,
  time,
  checked,
  onValueChange,
}) => {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="mr-5">
          <MaterialDesignIcons name={icon} color={colors.off_white} size={25} />
        </View>

        <View>
          <Text className="text-white">{label}</Text>
          <Text className="text-light_green">{time}</Text>
        </View>
      </View>

      <CustomCheckbox checked={checked} onValueChange={onValueChange} />
    </View>
  );
};

export default CheckboxCard;
