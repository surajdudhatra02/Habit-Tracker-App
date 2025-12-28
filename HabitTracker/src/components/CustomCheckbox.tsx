import { View } from 'react-native';
import React from 'react';
import CheckBox from '@react-native-community/checkbox';
import { colors } from '../constants';

const CustomCheckbox = ({ checked, onValueChange }) => {
  return (
    <View>
      <CheckBox
        boxType="circle"
        value={checked}
        onValueChange={onValueChange}
        tintColors={{ true: colors.light_green }}
        onCheckColor={colors.green}
        onTintColor={colors.green}
      />
    </View>
  );
};

export default CustomCheckbox;
