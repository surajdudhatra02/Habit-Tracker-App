import {
  HomeScreen,
  NewHabitScreen,
  ProgressScreen,
  SettingsScreen,
  TodayHabitsScreen,
} from '../screens';

export enum Routes {
  Main = 'Main',
  Home = 'Home',
  Progress = 'Progress',
  Settings = 'Settings',
  NewHabit = 'NewHabit',
  TodayHabits = 'TodayHabits',
}

export const RouteScreens = {
  [Routes.Home]: HomeScreen,
  [Routes.Progress]: ProgressScreen,
  [Routes.Settings]: SettingsScreen,
  [Routes.NewHabit]: NewHabitScreen,
  [Routes.TodayHabits]: TodayHabitsScreen,
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
  [Routes.NewHabit]: undefined;
  [Routes.TodayHabits]: undefined;
};
