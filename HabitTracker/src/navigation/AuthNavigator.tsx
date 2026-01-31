import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList, Routes, RouteScreens } from './route';

const AuthNavigator = () => {
  const Stack = createNativeStackNavigator<AuthStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={Routes.Login}
        component={RouteScreens[Routes.Login]}
      />

      <Stack.Screen
        name={Routes.SignUp}
        component={RouteScreens[Routes.SignUp]}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
