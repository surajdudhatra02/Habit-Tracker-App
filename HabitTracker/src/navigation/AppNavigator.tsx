import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import { RootStackParamList, Routes, RouteScreens } from './route';

const AppNavigator = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: '#141414',
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
