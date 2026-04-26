import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '../hooks';
import { validateEmail } from '../utils';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { Routes } from '../navigation/route';
import { Button, Input } from '../components';


const ForgotPasswordScreen = ({ navigation }: any) => {
  const { sendPasswordResetOtp } = useAuthActions();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      showErrorToast('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOtp(trimmedEmail);
      showSuccessToast('OTP Sent', 'Please check your email for the verification code');
      navigation.navigate(Routes.VerifyOtp, { email: trimmedEmail });
    } catch (err: any) {
      showErrorToast('Failed to send OTP', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-dark_bg flex-1 p-6">
      <Text className="text-grey_text mb-10 mt-4 text-base">Enter your email address to receive a 6-digit verification code.</Text>

      <View className="w-full gap-6">
        <Input
          placeholder="Enter Email"
          className="p-5"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          text={loading ? 'Sending...' : 'Send OTP'}
          className="bg-light_green px-6 py-4 rounded-2xl flex-row items-center justify-center mt-4"
          textClassName="text-black font-bold text-base"
          onPress={onSendOtp}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
