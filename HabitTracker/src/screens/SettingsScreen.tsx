import { View, Text, ScrollView } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Divider, ToggleSwitch } from '../components';

const SettingsScreen = () => {
  const shareIcon = (
    <MaterialDesignIcons name="share" color={'#949494'} size={23} />
  );
  const rateIcon = (
    <MaterialDesignIcons name="star" color={'#949494'} size={23} />
  );
  const rightIcon = (
    <MaterialDesignIcons name="menu-right" color={'#949494'} size={30} />
  );

  return (
    <ScrollView className="flex-1 bg-dark_bg">
      <View className="p-4">
        <Text className="text-off_white text-2xl font-bold mb-4">
          Appearance
        </Text>

        <View className="bg-light_grey p-4 rounded-xl flex-row items-center justify-between">
          <View>
            <Text className="text-off_white text-2xl">Theme</Text>
            <Text className="text-light_green text-xl ">System</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-grey_text text-xl ">Dark</Text>
            {rightIcon}
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="text-off_white text-2xl font-bold mb-4">Settings</Text>

        <View className="bg-light_grey p-4 rounded-xl">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-2xl">Notification</Text>
            </View>
            <View>
              <ToggleSwitch />
            </View>
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-2xl">Reminders</Text>
            </View>
            <View>
              <ToggleSwitch />
            </View>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="text-off_white text-2xl font-bold mb-4">
          App Information
        </Text>

        <View className="bg-light_grey p-4 rounded-xl">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-2xl">Share App</Text>
            </View>
            <View>{shareIcon}</View>
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-2xl">Rate </Text>
            </View>
            <View>{rateIcon}</View>
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-off_white text-2xl">Privacy Policy</Text>
            </View>
            <View>{rightIcon}</View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
