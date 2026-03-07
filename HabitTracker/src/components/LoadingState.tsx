import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Text, View } from 'react-native';
import { colors } from '../constants';

const LoadingState = () => (
  <View className="flex-1 items-center justify-center py-24">
    <View
      className="rounded-full p-5 mb-4"
      style={{ backgroundColor: '#1C1C1F' }}
    >
      <MaterialDesignIcons
        name="loading"
        size={36}
        color={colors.light_green}
      />
    </View>
    <Text className="text-grey_text text-sm">Loading your habits…</Text>
  </View>
);

export default LoadingState;
