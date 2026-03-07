import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants';
import Button from './Button';

const EmptyState = ({ onPress }: { onPress: () => void }) => (
  <View className="flex-1 items-center justify-center py-24">
    <View
      className="rounded-full p-7 mb-6"
      style={{ backgroundColor: '#1C1C1F' }}
    >
      <MaterialDesignIcons
        name="clipboard-list-outline"
        size={56}
        color={colors.light_green}
      />
    </View>
    <Text className="text-off_white text-2xl font-bold mb-3 text-center">
      No Habits Yet
    </Text>
    <Text className="text-grey_text text-sm text-center px-10 leading-6 mb-8">
      Start building better habits today. Small steps lead to big changes.
    </Text>
    <Button
      text="Create First Habit"
      className="bg-light_green px-7 py-4 rounded-2xl"
      textClassName="text-black font-bold text-base"
      icon={<MaterialDesignIcons name="plus" size={18} color={colors.black} />}
      onPress={onPress}
    />
  </View>
);

export default EmptyState;
