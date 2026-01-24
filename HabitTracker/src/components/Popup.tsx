import { View, Text, Modal, Pressable } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from './Button';
import { colors } from '../constants';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

type PopupProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const Popup: React.FC<PopupProps> = ({
  visible,
  title,
  message,
  type = 'info',
  showCancel = true,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: colors.light_green };
      case 'error':
        return { name: 'close-circle', color: '#ff6b6b' };
      case 'warning':
        return { name: 'alert-circle', color: '#ffd93d' };
      default:
        return { name: 'information', color: colors.light_green };
    }
  };

  const icon = getIconConfig();

  return (
    <SafeAreaView>
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={onCancel}
      >
        <View className="flex-1 bg-transparent justify-center items-center px-6">
          <Pressable className="bg-dark_grey rounded-2xl w-full max-w-sm">
            <View className="items-center pt-6 pb-4">
              {/* Icon */}
              <View className="items-center pt-6 pb-4">
                <MaterialDesignIcons
                  name={icon.name}
                  size={64}
                  color={icon.color}
                />
              </View>

              {/* Title */}
              <Text className="text-off_white text-2xl font-bold text-center px-6">
                {title}
              </Text>

              {/* Message */}
              <Text className="text-off_white text-base text-center px-6 py-4 leading-6">
                {message}
              </Text>

              <View className="flex-row px-4 pb-4 gap-3">
                <Button
                  text={cancelText}
                  className="border-2 border-light_grey px-6 py-4 rounded-xl"
                  textClassName="text-off_white font-bold text-base text-center"
                  onPress={onCancel}
                />

                <Button
                  text={confirmText}
                  className="bg-light_green px-6 py-4 rounded-xl"
                  textClassName="text-black font-bold text-base text-center"
                  onPress={onConfirm}
                />
              </View>
            </View>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Popup;
