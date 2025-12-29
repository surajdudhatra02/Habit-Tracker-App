import { View, Text } from 'react-native';
import React from 'react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import CustomCheckbox from './CustomCheckbox';

interface ReminderItemProps {
  icon: string;
  label: string;
  time: string;
  description?: string;
  goal?: string;
  checked: boolean;
  onValueChange: (value: boolean) => void;
}

const CheckboxCard: React.FC<ReminderItemProps> = ({
  icon,
  label,
  time,
  description,
  goal,
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
          <Text className="text-white font-semibold text-xl">{label}</Text>

          {description && (
            <Text className="text-white mb-3">{description}</Text>
          )}

          <Text className="text-light_green">{time}</Text>

          {goal && <Text className="text-light_green mt-1">Goal: {goal}</Text>}
        </View>
      </View>

      <CustomCheckbox checked={checked} onValueChange={onValueChange} />
    </View>
  );
};

export default CheckboxCard;
