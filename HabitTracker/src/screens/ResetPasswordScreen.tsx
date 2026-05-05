import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';
import { Routes } from '../navigation/route';
import { useAuth, useAuthActions } from '../hooks';
import { showErrorToast, showSuccessToast } from '../utils/toast';

const ResetPasswordScreen = ({ navigation }: any) => {
  const { updatePassword } = useAuthActions();
  const { logout, clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    if (password.length < 6) {
      showErrorToast(
        'Invalid Password',
        'Password must be at least 6 characters',
      );
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast('Password Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      await logout();
      clearPasswordRecovery();
      showSuccessToast('Success', 'Your password has been reset successfully');
      navigation.reset({
        index: 0,
        routes: [{ name: Routes.Login }],
      });
    } catch (err: any) {
      showErrorToast('Update Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-dark_bg flex-1 p-6">
      <Text className="text-grey_text mb-10 mt-4 text-base">
        Enter your new password below.
      </Text>

      <View className="w-full gap-6">
        <Input
          placeholder="New Password"
          className="p-5"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          placeholder="Confirm Password"
          className="p-5"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button
          text={loading ? 'Updating...' : 'Reset Password'}
          className="bg-light_green px-6 py-4 rounded-2xl flex-row items-center justify-center mt-4"
          textClassName="text-black font-bold text-base"
          onPress={onReset}
          disabled={loading}
        />

        <TouchableOpacity
          onPress={async () => {
            await logout();
            clearPasswordRecovery();
            navigation.reset({ index: 0, routes: [{ name: Routes.Login }] });
          }}
          className="mt-2 items-center"
        >
          <Text className="text-light_green font-bold text-base">
            Cancel & Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
