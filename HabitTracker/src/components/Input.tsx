import { TextInput } from 'react-native';
import React from 'react';
import { colors } from '../constants';

const Input = ({
  placeholder,
  lines,
  value,
  onChangeText,
  className,
  ...props
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      className={`bg-dark_grey text-light_green rounded-xl p-4 ${
        className ?? ''
      }`}
      placeholderTextColor={colors.off_white}
      numberOfLines={lines}
      multiline
      textAlignVertical="top"
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  );
};

export default Input;
