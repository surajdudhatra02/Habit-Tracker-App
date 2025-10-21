import { View, Text } from 'react-native';

interface SuccessRateProps {
  percentage: number;
}

const SuccessRate = ({ percentage }: SuccessRateProps) => {
  return (
    <View className="bg-dark_grey p-6 rounded-xl items-center justify-center mt-4">
      <Text className="text-grey_text text-lg font-medium mb-2">
        Success Rate
      </Text>
      <Text className="text-green text-5xl font-bold">
        {percentage}%
      </Text>
    </View>
  );
};

export default SuccessRate;