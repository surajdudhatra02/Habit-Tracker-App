import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { FontAwesome } from "@react-native-vector-icons/fontawesome";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#141414', // header background
        },
        headerTintColor: '#ede8e8', // header text/icon color
        headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: "center"
        },
        headerTitleAlign: "center",
        tabBarStyle: {
          backgroundColor: '#141414', // bottom bar background
          borderTopWidth: 0,
          height: 60,
        },
        tabBarActiveTintColor: '#48ea76', // active tab color
        tabBarInactiveTintColor: '#ede8e8', // inactive tab color

        tabBarIcon: ({ color, size }) => {
          let iconName: 'home' | 'bar-chart-o' | 'gear' = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Progress') {
            iconName = 'bar-chart-o';
          } else if (route.name === 'Settings') {
            iconName = 'gear';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{headerTitle: "Habit Spark"}} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};