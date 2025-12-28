import { View, TextInput } from 'react-native';
import React from 'react';
import { colors } from '../constants';

const Input = ({ placeholder, lines }) => {
  return (
    <TextInput
      placeholder={placeholder}
      className="bg-dark_grey text-light_green rounded-xl p-4"
      placeholderTextColor={colors.off_white}
      numberOfLines={lines}
      multiline
      textAlignVertical="top"
    />
  );
};

export default Input;
