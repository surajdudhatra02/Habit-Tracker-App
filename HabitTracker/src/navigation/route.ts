import {
  LoginScreen,
  SignUpScreen,
  EmailConfirmationScreen,
  HomeScreen,
  NewHabitScreen,
  ProgressScreen,
  SettingsScreen,
  TodayHabitsScreen,
  HabitsScreen,
  HabitDetailsScreen,
} from '../screens';

export enum Routes {
  Login = 'Login',
  SignUp = 'SignUp',
  EmailConfirm = 'EmailConfirm',

  Main = 'Main',
  Home = 'Home',
  Progress = 'Progress',
  Settings = 'Settings',
  NewHabit = 'NewHabit',
  TodayHabits = 'TodayHabits',
  Habits = 'Habits',
  HabitDetails = 'HabitDetails',
}

export const RouteScreens = {
  [Routes.Login]: LoginScreen,
  [Routes.SignUp]: SignUpScreen,
  [Routes.EmailConfirm]: EmailConfirmationScreen,

  [Routes.Home]: HomeScreen,
  [Routes.Progress]: ProgressScreen,
  [Routes.Settings]: SettingsScreen,
  [Routes.NewHabit]: NewHabitScreen,
  [Routes.TodayHabits]: TodayHabitsScreen,
  [Routes.Habits]: HabitsScreen,
  [Routes.HabitDetails]: HabitDetailsScreen,
};

export type AuthStackParamList = {
  [Routes.Login]: undefined;
  [Routes.SignUp]: undefined;
  [Routes.EmailConfirm]: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  [Routes.Home]: undefined;
  [Routes.Progress]: undefined;
  [Routes.Settings]: undefined;
  [Routes.NewHabit]: { habit?: import('../types').Habit } | undefined;
  [Routes.TodayHabits]: undefined;
  [Routes.Habits]: undefined;
  [Routes.HabitDetails]: { habit: import('../types').Habit };
};
