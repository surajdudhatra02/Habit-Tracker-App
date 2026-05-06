import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Button, Divider, ToggleSwitch } from '../components';
import { colors } from '../constants';
import { useAuth } from '../hooks';
import { Routes } from '../navigation/route';

const SettingsScreen = ({ navigation }: any) => {
  const { logout, user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';
  const email = user?.email ?? '';
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';

  const rightIcon = (
    <MaterialDesignIcons name="menu-right" color={colors.grey_text} size={30} />
  );
  const shareIcon = (
    <MaterialDesignIcons name="share" color={colors.grey_text} size={23} />
  );
  const rateIcon = (
    <MaterialDesignIcons name="star" color={colors.grey_text} size={23} />
  );

  return (
    <ScrollView className="flex-1 bg-dark_bg">
      {/* Profile Row */}
      <View className="p-4">
        <TouchableOpacity
          onPress={() => navigation.navigate(Routes.ProfileInfo)}
          activeOpacity={0.75}
        >
          <View className="bg-dark_grey rounded-2xl p-4 flex-row items-center">
            {/* Avatar */}
            <View
              className="w-14 h-14 rounded-full items-center justify-center mr-4"
              style={{
                backgroundColor: colors.dark_green,
                borderWidth: 1.5,
                borderColor: colors.light_green,
              }}
            >
              <Text
                style={{
                  color: colors.light_green,
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
              >
                {avatarLetter}
              </Text>
            </View>

            {/* Name & Email */}
            <View className="flex-1">
              <Text className="text-off_white text-lg font-bold">
                {displayName}
              </Text>
              <Text className="text-grey_text text-sm" numberOfLines={1}>
                {email}
              </Text>
            </View>

            {/* Arrow */}
            <MaterialDesignIcons
              name="chevron-right"
              color={colors.grey_text}
              size={26}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Appearance */}
      <View className="px-4 pb-4">
        <Text className="text-off_white text-title_Font font-bold mb-4">
          Appearance
        </Text>

        <View className="bg-light_grey p-4 rounded-2xl flex-row items-center justify-between">
          <View>
            <Text className="text-off_white text-xl">Theme</Text>
            <Text className="text-light_green text-xl">System</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-grey_text text-xl">Dark</Text>
            {rightIcon}
          </View>
        </View>
      </View>

      {/* Settings */}
      <View className="px-4 pb-4">
        <Text className="text-off_white text-title_Font font-bold mb-4">
          Settings
        </Text>

        <View className="bg-light_grey p-4 rounded-2xl">
          <View className="flex-row items-center justify-between">
            <Text className="text-off_white text-xl">Notification</Text>
            <ToggleSwitch />
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <Text className="text-off_white text-xl">Reminders</Text>
            <ToggleSwitch />
          </View>
        </View>
      </View>

      {/* App Information */}
      <View className="px-4 pb-4">
        <Text className="text-off_white text-title_Font font-bold mb-4">
          App Information
        </Text>

        <View className="bg-light_grey p-4 rounded-2xl">
          <View className="flex-row items-center justify-between">
            <Text className="text-off_white text-xl">Share App</Text>
            {shareIcon}
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <Text className="text-off_white text-xl">Rate</Text>
            {rateIcon}
          </View>

          <Divider />

          <View className="flex-row items-center justify-between">
            <Text className="text-off_white text-xl">Privacy Policy</Text>
            {rightIcon}
          </View>
        </View>
      </View>

      <Button
        text="Logout"
        onPress={logout}
        className="bg-dark_grey px-6 py-4 mx-4 mb-6 rounded-2xl flex-row items-center justify-center border border-light_grey"
        textClassName="text-white font-bold text-base"
      />
    </ScrollView>
  );
};

export default SettingsScreen;
