import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';
import { Routes } from '../navigation/route';
import { useAuthActions } from '../hooks';
import { showErrorToast, showSuccessToast } from '../utils/toast';

const VerifyOtpScreen = ({ route, navigation }: any) => {
  const { email } = route.params;
  const { verifyPasswordResetOtp } = useAuthActions();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    if (otp.trim().length < 6) {
      showErrorToast('Invalid OTP', 'Please enter a valid verification code');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOtp(email, otp.trim());
      showSuccessToast('Verified', 'You can now reset your password');
      navigation.navigate(Routes.ResetPassword);
    } catch (err: any) {
      showErrorToast('Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-dark_bg flex-1 p-6">
      <Text className="text-grey_text mb-10 mt-4 text-base">
        We've sent a verification code to {email}.
      </Text>

      <View className="w-full gap-6">
        <Input
          placeholder="Verification Code"
          className="p-5"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={10}
        />

        <Button
          text={loading ? 'Verifying...' : 'Verify OTP'}
          className="bg-light_green px-6 py-4 rounded-2xl flex-row items-center justify-center mt-4"
          textClassName="text-black font-bold text-base"
          onPress={onVerify}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtpScreen;
