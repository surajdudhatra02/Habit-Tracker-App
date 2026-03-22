import React from 'react';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { colors } from '../constants';
import { Platform } from 'react-native';

export const toastConfig: ToastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.light_green,
        backgroundColor: colors.dark_grey,
        top: Platform.OS === 'ios' ? 30 : null,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
      }}
      text2Style={{
        fontSize: 14,
        color: colors.grey_text,
      }}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors.red,
        backgroundColor: colors.dark_grey,
        top: Platform.OS === 'ios' ? 30 : null,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
      }}
      text2Style={{
        fontSize: 14,
        color: colors.grey_text,
      }}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.yellow,
        backgroundColor: colors.dark_grey,
        top: Platform.OS === 'ios' ? 30 : null,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
      }}
      text2Style={{
        fontSize: 14,
        color: colors.grey_text,
      }}
    />
  ),
};
