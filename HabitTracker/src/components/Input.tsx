import {
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  StyleSheet,
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
  multiline,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const isMultiline = multiline ?? (lines ?? props.numberOfLines ?? 1) > 1;

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <TextInput
        {...props}
        placeholder={placeholder}
        className={className}
        style={[styles.input, isMultiline && styles.multiline, style]}
        placeholderTextColor={props.placeholderTextColor ?? colors.grey_text}
        selectionColor={props.selectionColor ?? colors.light_green}
        numberOfLines={lines ?? props.numberOfLines}
        multiline={isMultiline}
        textAlignVertical={
          props.textAlignVertical ?? (isMultiline ? 'top' : 'center')
        }
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(visible => !visible)}
          style={styles.passwordToggle}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            isPasswordVisible ? 'Hide password' : 'Show password'
          }
          accessibilityState={{ selected: isPasswordVisible }}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark_grey,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.card_border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  focused: { borderColor: colors.light_green },
  input: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.off_white,
    fontSize: 15,
  },
  multiline: { minHeight: 92, lineHeight: 22 },
  passwordToggle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Input;
