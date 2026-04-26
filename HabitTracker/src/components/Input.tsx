import {
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { colors } from '../constants';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

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
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View className="bg-dark_grey rounded-2xl flex-row items-center">
      <TextInput
        placeholder={placeholder}
        className={`flex-1 text-light_green p-4 ${className ?? ''}`}
        placeholderTextColor={colors.off_white}
        numberOfLines={lines}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPassword && !isPasswordVisible}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          className="pr-4"
          activeOpacity={0.7}
        >
          <MaterialDesignIcons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.grey_text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Input;
