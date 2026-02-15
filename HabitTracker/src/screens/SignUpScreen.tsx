import { useState } from 'react';
import { useAuthActions } from '../hooks';
import { Routes } from '../navigation/route';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Button, Input } from '../components';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignUpScreen = ({ navigation }) => {
  const { signUpWithEmail, loginWithGoogle } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      console.log('Invalid email format');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long',
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signUpWithEmail(trimmedEmail, trimmedPassword);

      if (result.needsEmailConfirmation) {
        navigation.navigate(Routes.EmailConfirm, {
          email: trimmedEmail,
        });
      } else {
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <ScrollView>
    <SafeAreaView className="bg-dark_bg flex-1 justify-center items-center">
      <Text className="text-5xl font-bold text-light_green mb-20">Sign Up</Text>

      <View className="w-full px-6 gap-6">
        <Input
          placeholder="Enter Email"
          className="p-5"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Input
          placeholder="Enter Password"
          className="p-5"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <Input
          placeholder="Confirm Password"
          className="p-5"
          value={confirm}
          secureTextEntry
          onChangeText={setConfirm}
        />

        <Button
          text={loading ? 'Creating Account...' : 'Sign Up'}
          className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center mt-4"
          textClassName="text-black font-bold text-base"
          onPress={onSignUp}
        />

        <Text className="text-xl text-center font-bold text-grey_text ">
          or
        </Text>

        <Button
          text="Sign Up with Google"
          className="bg-light_grey px-6 py-4 rounded-xl flex-row items-center justify-center"
          textClassName="text-white font-bold text-base"
          onPress={loginWithGoogle}
        />
      </View>

      <View className="flex-row items-center mt-20">
        <Text className="text-sm text-grey_text">Have an account ? </Text>
        <TouchableOpacity onPress={() => navigation.navigate(Routes.Login)}>
          <Text className="text-sm text-off_white">Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    // </ScrollView>
  );
};

export default SignUpScreen;
