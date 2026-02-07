import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';

const LoginScreen = () => {
  const login = () => {
    console.log('login');
  };
  return (
    <SafeAreaView className="bg-dark_bg flex-1 justify-center items-center">
      <Text className="text-5xl font-bold text-light_green mb-20">Login</Text>

      <View className="w-full px-6 gap-6">
        <Input placeholder="Enter Email" className="p-5" />
        <Input placeholder="Enter Password" className="p-5" />

        <Button
          text="Login"
          className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center mt-4"
          textClassName="text-black font-bold text-base"
          onPress={login}
        />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
