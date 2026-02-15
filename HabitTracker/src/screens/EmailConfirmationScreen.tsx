import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components';
import { Routes } from '../navigation/route';
import { useAuthActions } from '../hooks';

const EmailConfirmationScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const { resendConfirmationEmail } = useAuthActions();
  const [loading, setLoading] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await resendConfirmationEmail(email);
      Alert.alert(
        'Email Sent',
        'Verification email has been sent. Please check your inbox.',
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-dark_bg flex-1 justify-center items-center px-6">
      <Text className="text-6xl mb-10">📧</Text>

      <Text className="text-3xl font-bold text-white text-center mb-4">
        Check Your Email
      </Text>

      <Text className="text-base text-center text-grey_text mb-2">
        We've sent a verification link to:
      </Text>

      <Text className="text-lg font-bold text-light_green text-center mb-8">
        {email}
      </Text>

      <Text className="text-sm text-center text-grey_text mb-10 leading-6">
        Click the link in the email to verify your account. You can then log in
        to start using the app.
      </Text>

      <View className="w-full gap-4">
        <Button
          text="Resend Verification Email"
          onPress={handleResendEmail}
          loading={loading}
          loadingColor="black"
          className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center"
          textClassName="text-black font-bold text-base"
        />

        <Button
          text="Go to Login"
          onPress={() => navigation.navigate(Routes.Login)}
          className="bg-dark_grey px-6 py-4 rounded-xl flex-row items-center justify-center border border-light_grey"
          textClassName="text-white font-bold text-base"
        />
      </View>

      <Text className="text-xs text-center text-grey_text mt-8">
        Didn't receive the email? Check your spam folder or resend it.
      </Text>
    </SafeAreaView>
  );
};

export default EmailConfirmationScreen;
