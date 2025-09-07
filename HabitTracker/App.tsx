import './global.css';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-3xl font-extrabold text-white">Hello, NativeWind!</Text>
        <Text className="mt-4 text-center text-lg text-gray-300">
          This is a React Native CLI app styled with Tailwind CSS.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default App;