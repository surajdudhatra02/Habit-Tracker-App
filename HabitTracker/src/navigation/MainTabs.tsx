import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { MainTabParamList, Routes, RouteScreens } from './route';
import { colors } from '../constants';

const Tab = createBottomTabNavigator<MainTabParamList>();
const icons = {
  Home: { active: 'home-variant', inactive: 'home-variant-outline' },
  Progress: { active: 'chart-box', inactive: 'chart-box-outline' },
  Settings: { active: 'account-circle', inactive: 'account-circle-outline' },
} as const;

const TabBar = ({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) => (
  <View
    style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
  >
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const icon = icons[route.name as keyof typeof icons];
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented)
            navigation.navigate(route.name, route.params);
        };
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            onLongPress={() =>
              navigation.emit({ type: 'tabLongPress', target: route.key })
            }
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
            activeOpacity={0.75}
            style={styles.tab}
          >
            <View style={styles.icon}>
              <MaterialDesignIcons
                name={focused ? icon.active : icon.inactive}
                size={23}
                color={focused ? colors.light_green : colors.grey_text}
              />
            </View>
            <Text style={[styles.label, focused && styles.activeLabel]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName={Routes.Home}
    tabBar={TabBar}
    screenOptions={{
      headerShown: false,
      sceneStyle: { backgroundColor: colors.dark_bg },
    }}
  >
    <Tab.Screen name={Routes.Home} component={RouteScreens[Routes.Home]} />
    <Tab.Screen
      name={Routes.Progress}
      component={RouteScreens[Routes.Progress]}
    />
    <Tab.Screen
      name={Routes.Settings}
      component={RouteScreens[Routes.Settings]}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark_bg,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  bar: {
    backgroundColor: colors.dark_grey,
    borderWidth: 1,
    borderColor: colors.card_border,
    borderRadius: 24,
    flexDirection: 'row',
    paddingVertical: 9,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: 48,
    height: 30,
  },
  label: { color: colors.grey_text, fontSize: 9, fontWeight: '500' },
  activeLabel: { color: colors.light_green },
});

export default MainTabs;
