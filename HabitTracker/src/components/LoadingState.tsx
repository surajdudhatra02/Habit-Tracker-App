import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../constants';

const LoadingState = () => (
  <View className="flex-1 items-center justify-center py-24">
    <View
      className="rounded-full p-5 mb-4"
      style={{ backgroundColor: '#1C1C1F' }}
    >
      <ActivityIndicator size="large" color={colors.light_green} />
    </View>
  </View>
);

export default LoadingState;
