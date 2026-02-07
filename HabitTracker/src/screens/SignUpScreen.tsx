import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';
import { Routes } from '../navigation/route';

const SignUpScreen = ({ navigation }) => {
  return (
    // <ScrollView>
    <SafeAreaView className="bg-dark_bg flex-1 justify-center items-center">
      <Text className="text-5xl font-bold text-light_green mb-20">Sign Up</Text>

      <View className="w-full px-6 gap-6">
        <Input placeholder="Enter Email" className="p-5" />
        <Input placeholder="Enter Password" className="p-5" />
        <Input placeholder="Confirm Password" className="p-5" />

        <Button
          text="Sign Up"
          className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center mt-4"
          textClassName="text-black font-bold text-base"
          // onPress={login}
        />

        <Text className="text-xl text-center font-bold text-grey_text ">
          or
        </Text>

        <Button
          text="Sign Up with Google"
          className="bg-light_grey px-6 py-4 rounded-xl flex-row items-center justify-center"
          textClassName="text-white font-bold text-base"
          // onPress={loginWithGoogle}
        />
      </View>

      <View className="flex-row items-center mt-20">
        <Text className="text-sm text-grey_text">Have an account ? </Text>
        <TouchableOpacity onPress={() => navigation.navigate(Routes.SignUp)}>
          <Text className="text-sm text-off_white">Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    // </ScrollView>
  );
};

export default SignUpScreen;
