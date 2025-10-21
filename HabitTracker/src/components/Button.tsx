import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';

export interface ButtonProps {
  text: string;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingColor?: string;
  accessibilityLabel?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  text,
  className = '',
  textClassName = '',
  icon,
  onPress,
  disabled = false,
  loading = false,
  loadingColor = '#ffffff',
  accessibilityLabel,
  children,
}) => {
  return (
    <TouchableOpacity
      className={className}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel}
    >
      {children ? (
        children
      ) : (
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator size="small" color={loadingColor} />
          ) : (
            <>
              {icon && <View className="mr-2">{icon}</View>}
              <Text className={textClassName}>{text}</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
