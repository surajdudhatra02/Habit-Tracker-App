import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components';
import { showErrorToast, showInfoToast } from '../utils/toast';
import DeviceInfo from 'react-native-device-info';
import { colors } from '../constants';
import MotionView from '../components/MotionView';
import { PLAY_STORE_APP_URI, PLAY_STORE_URL } from '../constants/appLinks';
import { useAuth, useAppUpdate } from '../hooks';
import { Routes } from '../navigation/route';
import BrandLogo from '../components/BrandLogo';

const SettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { status, message, url } = useAppUpdate();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';
  const email = user?.email ?? '';
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';

  const handleShareApp = async () => {
    try {
      await Share.share(
        {
          title: 'Habitz - Evolve Daily',
          message: `Build better habits with Habitz!\n${PLAY_STORE_URL}`,
        },
        { dialogTitle: 'Share Habitz' },
      );
    } catch {
      showErrorToast('Unable to share app', 'Please try again.');
    }
  };

  const handleRateApp = async () => {
    try {
      if (Platform.OS === 'android') {
        try {
          await Linking.openURL(PLAY_STORE_APP_URI);
          return;
        } catch {
          // Devices without a Play Store handler can open the web listing.
        }
      }
      await Linking.openURL(PLAY_STORE_URL);
    } catch {
      showErrorToast('Unable to open store', 'Please try again.');
    }
  };

  const appRows: {
    title: string;
    description: string;
    icon: React.ComponentProps<typeof MaterialDesignIcons>['name'];
    label: string;
    onPress: () => void;
  }[] = [
    {
      title: 'Share App',
      description: 'Better habits are better together',
      icon: 'share-variant-outline',
      label: 'Share Habitz',
      onPress: handleShareApp,
    },
    {
      title: 'Rate App',
      description: 'A little love goes a long way',
      icon: 'star-outline',
      label: 'Rate Habitz',
      onPress: handleRateApp,
    },
    {
      title: 'Privacy Policy',
      description: 'Your information, your peace of mind',
      icon: 'shield-check-outline',
      label: 'Privacy Policy',
      onPress: () => {
        Linking.openURL('https://sites.google.com/view/habitz-privacy').catch(
          () =>
            showErrorToast(
              'Unable to open privacy policy',
              'Please try again.',
            ),
        );
      },
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-dark_bg"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 32 }}
    >
      <View className="px-6">
        <MotionView className="mb-7">
          <Text className="text-grey_text text-xs font-bold tracking-[3px] mb-2">
            A LITTLE MORE YOU
          </Text>
          <Text className="text-white text-[34px] font-bold tracking-tight">
            Your space
          </Text>
          <Text className="text-grey_text text-sm mt-2">
            Make yourself at home.
          </Text>
        </MotionView>

        <MotionView delay={60}>
          <TouchableOpacity
            onPress={() => navigation.navigate(Routes.ProfileInfo)}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            activeOpacity={0.75}
            className="bg-dark_grey border border-card_border rounded-3xl p-5 mb-7"
          >
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-[22px] items-center justify-center mr-4 bg-light_green">
                <Text className="text-dark_bg text-[28px] font-bold">
                  {avatarLetter}
                </Text>
              </View>
              <View className="flex-1 mr-2">
                <Text
                  className="text-white text-xl font-bold mb-1"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <Text className="text-grey_text text-xs" numberOfLines={1}>
                  {email}
                </Text>
              </View>
              <MaterialDesignIcons
                name="chevron-right"
                color={colors.grey_text}
                size={23}
              />
            </View>
            <View className="border-t border-card_border mt-5 pt-4 flex-row items-center justify-between">
              <Text className="text-grey_text text-xs">
                Your own kind of growth.
              </Text>
              <Text className="text-light_green text-xs font-semibold">
                Edit profile
              </Text>
            </View>
          </TouchableOpacity>
        </MotionView>

        {status === 'soft' && (
          <MotionView
            delay={90}
            className="bg-dark_green border border-icon_bg rounded-3xl p-5 mb-7"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialDesignIcons
                name="cellphone-arrow-down"
                size={21}
                color={colors.light_green}
              />
              <Text className="text-white font-bold text-base">
                A fresh update is here
              </Text>
            </View>
            <Text className="text-grey_text text-xs leading-5 mb-4">
              {message || 'Get the latest improvements for your daily routine.'}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                if (url) {
                  Linking.openURL(url).catch(() =>
                    showErrorToast(
                      'Unable to open update',
                      'Please try again.',
                    ),
                  );
                } else {
                  showInfoToast('Update', 'App update URL not found.');
                }
              }}
              activeOpacity={0.8}
              className="bg-light_green self-start px-5 py-2.5 rounded-full"
            >
              <Text className="text-dark_bg font-bold text-xs">
                Update Habitz
              </Text>
            </TouchableOpacity>
          </MotionView>
        )}

        <MotionView delay={120}>
          <Text className="text-white text-lg font-bold mb-4 tracking-tight">
            Made for your everyday
          </Text>
          <View className="bg-dark_grey border border-card_border rounded-3xl px-4 mb-6">
            {appRows.map((row, index) => (
              <TouchableOpacity
                key={row.title}
                onPress={row.onPress}
                accessibilityRole="button"
                accessibilityLabel={row.label}
                activeOpacity={0.7}
                className={`flex-row items-center py-5 ${index > 0 ? 'border-t border-card_border' : ''}`}
              >
                <View className="w-10 h-10 rounded-2xl items-center justify-center mr-3 bg-icon_bg">
                  <MaterialDesignIcons
                    name={row.icon}
                    size={21}
                    color={colors.light_green}
                  />
                </View>
                <View className="flex-1 mr-2">
                  <Text className="text-off_white text-sm font-semibold mb-1">
                    {row.title}
                  </Text>
                  <Text className="text-grey_text text-[11px] leading-4">
                    {row.description}
                  </Text>
                </View>
                <MaterialDesignIcons
                  name="chevron-right"
                  color={colors.grey_text}
                  size={20}
                />
              </TouchableOpacity>
            ))}
          </View>
        </MotionView>
        <MotionView delay={180}>
          <Button
            text="Logout"
            onPress={logout}
            className="bg-dark_grey border border-card_border py-4 rounded-2xl"
            textClassName="text-off_white font-semibold text-sm"
            icon={
              <MaterialDesignIcons
                name="logout"
                size={18}
                color={colors.grey_text}
              />
            }
          />
        </MotionView>
        <View className="items-center pt-8 pb-4">
          <View className="mb-2">
            <BrandLogo size={24} />
          </View>
          <Text className="text-grey_text text-[10px] tracking-[2px] mb-3">
            SMALL STEPS. REAL CHANGE.
          </Text>
          <Text className="text-grey_text text-[10px]">
            Version {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
