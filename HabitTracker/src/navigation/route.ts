import {
  HomeScreen,
  NewHabitScreen,
  ProgressScreen,
  SettingsScreen,
} from '../screens';

export enum Routes {
  Main = 'Main',
  Home = 'Home',
  Progress = 'Progress',
  Settings = 'Settings',
  NewHabit = 'NewHabit',
}

export const RouteScreens = {
  [Routes.Home]: HomeScreen,
  [Routes.Progress]: ProgressScreen,
  [Routes.Settings]: SettingsScreen,
  [Routes.NewHabit]: NewHabitScreen,
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
};
