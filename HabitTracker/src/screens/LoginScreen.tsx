import { View, Text, Linking, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';
import { Routes } from '../navigation/route';
import { useAuthActions } from '../hooks';
import { validateEmail } from '../utils';

const login = () => {
  // console.log('login');
};

const LoginScreen = ({ navigation }) => {
  const { loginWithGoogle, loginWithEmail } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password.trim());
    } catch (err: any) {
      if (err.message.include('Email not confirmed')) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in.',
          [
            { text: 'OK' },
            {
              text: 'Resend Email',
              onPress: () => {
                navigation.navigate(Routes.EmailConfirm, { email });
              },
            },
          ],
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-dark_bg flex-1 justify-center items-center">
      <Text className="text-5xl font-bold text-light_green mb-20">Login</Text>

      <View className="w-full px-6 gap-6">
        <Input
          placeholder="Enter Email"
          className="p-5"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="Enter Password"
          className="p-5"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />

        <Button
          text={loading ? 'Logging in...' : 'Login'}
          className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center mt-4"
          textClassName="text-black font-bold text-base"
          onPress={onLogin}
          disabled={loading}
        />

        <Text className="text-xl text-center font-bold text-grey_text ">
          or
        </Text>

        <Button
          text="Login with Google"
          className="bg-light_grey px-6 py-4 rounded-xl flex-row items-center justify-center"
          textClassName="text-white font-bold text-base"
          onPress={loginWithGoogle}
        />
      </View>

      <View className="flex-row items-center mt-20">
        <Text className="text-sm text-grey_text">Don't have an account ? </Text>
        <TouchableOpacity onPress={() => navigation.navigate(Routes.SignUp)}>
          <Text className="text-sm text-off_white">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
