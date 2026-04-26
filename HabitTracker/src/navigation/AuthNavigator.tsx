import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList, Routes, RouteScreens } from './route';
import { colors } from '../constants';

const AuthNavigator = () => {
  const Stack = createNativeStackNavigator<AuthStackParamList>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: colors.dark_bg,
        },
        headerTintColor: '#ede8e8',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 26,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name={Routes.Login}
        component={RouteScreens[Routes.Login]}
      />

      <Stack.Screen
        name={Routes.SignUp}
        component={RouteScreens[Routes.SignUp]}
      />

      <Stack.Screen
        name={Routes.EmailConfirm}
        component={RouteScreens[Routes.EmailConfirm]}
      />

      <Stack.Screen
        name={Routes.ForgotPassword}
        component={RouteScreens[Routes.ForgotPassword]}
        options={{ headerShown: true, headerTitle: 'Forgot Password' }}
      />

      <Stack.Screen
        name={Routes.VerifyOtp}
        component={RouteScreens[Routes.VerifyOtp]}
        options={{ headerShown: true, headerTitle: 'Verify OTP' }}
      />

      <Stack.Screen
        name={Routes.ResetPassword}
        component={RouteScreens[Routes.ResetPassword]}
        options={{ headerShown: true, headerTitle: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
