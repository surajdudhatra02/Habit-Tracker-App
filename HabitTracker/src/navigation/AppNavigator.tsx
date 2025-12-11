import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewHabitScreen } from '../screens';
import { RootStackParamList } from './types';
import MainTabs from './MainTabs';

const AppNavigator = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <Stack.Navigator>
      <Stack.Screen name='Main' component={MainTabs} options={{headerShown : false}} />
      <Stack.Screen name='NewHabit' component={NewHabitScreen} options={{ headerTitle: 'New Habit' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
