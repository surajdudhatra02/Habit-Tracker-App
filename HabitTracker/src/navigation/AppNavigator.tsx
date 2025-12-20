import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import MainTabs from './MainTabs';
import { Routes, RouteScreens } from './route';

const AppNavigator = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Routes.Main}
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.NewHabit}
        component={RouteScreens[Routes.NewHabit]}
        options={{ headerTitle: 'New Habit' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
