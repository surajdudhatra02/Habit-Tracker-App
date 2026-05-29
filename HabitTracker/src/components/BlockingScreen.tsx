import React from 'react';
import { View, Text, Modal, Linking } from 'react-native';
import Button from './Button';
import { colors } from '../constants';
import Icon from '@react-native-vector-icons/material-design-icons';

export interface BlockingScreenProps {
  visible: boolean;
  type: 'hard' | 'maintenance';
  message: string;
  url?: string;
}

const BlockingScreen: React.FC<BlockingScreenProps> = ({
  visible,
  type,
  message,
  url,
}) => {
  const handleUpdate = () => {
    if (url) {
      Linking.openURL(url).catch(err =>
        console.error('An error occurred', err),
      );
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View className="flex-1 bg-dark_bg items-center justify-center p-6">
        <Icon
          name={type === 'maintenance' ? 'tools' : 'cellphone-arrow-down'}
          size={80}
          color={colors.light_green}
          style={{ marginBottom: 20 }}
        />

        <Text className="text-white text-2xl font-bold text-center mb-4">
          {type === 'maintenance' ? 'App Offline' : 'Update Required'}
        </Text>

        <Text className="text-gray-300 text-base text-center mb-10">
          {message}
        </Text>

        {type === 'hard' && (
          <Button
            text="Update Now"
            onPress={handleUpdate}
            className="bg-light_green w-full py-4 rounded-xl shadow-lg"
            textClassName="text-dark_bg text-center font-bold text-lg"
          />
        )}
      </View>
    </Modal>
  );
};

export default BlockingScreen;
