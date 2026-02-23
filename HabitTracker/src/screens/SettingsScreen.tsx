import { View, Text, ScrollView } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Button, Divider, ToggleSwitch } from '../components';
import { colors } from '../constants';
import { useAuth } from '../hooks';

const SettingsScreen = () => {
  const { logout } = useAuth();

  const shareIcon = (
    <MaterialDesignIcons name="share" color={colors.grey_text} size={23} />
  );
  const rateIcon = (
    <MaterialDesignIcons name="star" color={colors.grey_text} size={23} />
  );
  const rightIcon = (
    <MaterialDesignIcons name="menu-right" color={colors.grey_text} size={30} />
  );

  return (
    <ScrollView className="flex-1 bg-dark_bg">
      <View className="p-4">
        <Text className="text-off_white text-title_Font font-bold mb-4">
          Appearance
        </Text>

        <View className="bg-light_grey p-4 rounded-xl flex-row items-center justify-between">
          <View>
            <Text className="text-off_white text-xl">Theme</Text>
            <Text className="text-light_green text-xl ">System</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-grey_text text-xl ">Dark</Text>
            {rightIcon}
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="text-off_white text-title_Font font-bold mb-4">
          Settings
        </Text>

        <View className="bg-light_grey p-4 rounded-xl">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-xl">Notification</Text>
            </View>
            <View>
              <ToggleSwitch />
            </View>
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-xl">Reminders</Text>
            </View>
            <View>
              <ToggleSwitch />
            </View>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="text-off_white text-title_Font font-bold mb-4">
          App Information
        </Text>

        <View className="bg-light_grey p-4 rounded-xl">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-xl">Share App</Text>
            </View>
            <View>{shareIcon}</View>
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-xl">Rate </Text>
            </View>
            <View>{rateIcon}</View>
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-xl">Privacy Policy</Text>
            </View>
            <View>{rightIcon}</View>
          </View>
        </View>
      </View>

      <Button
        text="Logout"
        onPress={logout}
        className="bg-dark_grey px-6 py-4 mx-4 rounded-xl flex-row items-center justify-center border border-light_grey"
        textClassName="text-white font-bold text-base"
      />
    </ScrollView>
  );
};

export default SettingsScreen;
