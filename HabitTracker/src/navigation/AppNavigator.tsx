import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import { RootStackParamList, Routes, RouteScreens } from './route';
import { colors } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: colors.dark_bg,
        },
        headerTintColor: colors.off_white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.dark_bg },
      }}
    >
      <Stack.Screen
        name={Routes.Main}
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.NewHabit}
        component={RouteScreens[Routes.NewHabit]}
        options={({ route }: any) => ({
          headerTitle: route.params?.habit ? 'Edit Habit' : 'New Habit',
        })}
      />
      <Stack.Screen
        name={Routes.TodayHabits}
        component={RouteScreens[Routes.TodayHabits]}
        options={{ headerTitle: "Today's Habits" }}
      />
      <Stack.Screen
        name={Routes.Habits}
        component={RouteScreens[Routes.Habits]}
        options={{ headerTitle: 'Habits' }}
      />
      <Stack.Screen
        name={Routes.HabitDetails}
        component={RouteScreens[Routes.HabitDetails]}
        options={{ headerTitle: 'Habit Details' }}
      />
      <Stack.Screen
        name={Routes.ProfileInfo}
        component={RouteScreens[Routes.ProfileInfo]}
        options={{ headerTitle: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
