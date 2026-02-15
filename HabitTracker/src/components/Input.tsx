import { TextInput, TextInputProps } from 'react-native';
import React from 'react';
import { colors } from '../constants';

interface InputProps extends TextInputProps {
  placeholder?: string;
  lines?: number;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  lines,
  value,
  onChangeText,
  className,
  multiline = false,
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
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  );
};

export default Input;
