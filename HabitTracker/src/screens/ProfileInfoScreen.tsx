import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import { useAuth } from '../hooks';
import { supabase } from '../lib/supabase';

const ProfileInfoScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState<string>(
    user?.user_metadata?.full_name || user?.user_metadata?.name || '',
  );
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync displayName when Supabase user metadata updates (after save or re-login)
  useEffect(() => {
    if (!isEditing) {
      setDisplayName(
        user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      );
    }
  }, [user, isEditing]);

  const email = user?.email ?? '—';
  const provider =
    user?.app_metadata?.provider === 'google' ? 'Google' : 'Email';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const avatarLetter = (displayName || email)[0]?.toUpperCase() ?? '?';

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Name Required', 'Please enter a display name.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });
      if (error) throw error;
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-dark_bg"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Avatar Section */}
      <View className="items-center pt-8 pb-6">
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: colors.dark_green,
            borderWidth: 2,
            borderColor: colors.light_green,
          }}
        >
          <Text
            style={{
              color: colors.light_green,
              fontSize: 40,
              fontWeight: 'bold',
            }}
          >
            {avatarLetter}
          </Text>
        </View>
        <Text className="text-off_white text-2xl font-bold">
          {displayName || 'No Name Set'}
        </Text>
        <View
          className="flex-row items-center mt-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: colors.dark_green }}
        >
          <MaterialDesignIcons
            name={provider === 'Google' ? 'google' : 'email-outline'}
            size={14}
            color={colors.light_green}
          />
          <Text className="text-light_green text-xs ml-1">{provider}</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View className="px-4 gap-y-4">
        {/* Display Name Card */}
        <View className="bg-dark_grey rounded-2xl p-5">
          <View className="flex-row items-center mb-1">
            <MaterialDesignIcons
              name="account-outline"
              size={16}
              color={colors.light_green}
            />
            <Text className="text-grey_text text-xs font-semibold uppercase ml-2 tracking-widest">
              Display Name
            </Text>
          </View>

          {isEditing ? (
            <View className="mt-3">
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={colors.grey_text}
                style={{
                  color: colors.off_white,
                  fontSize: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.light_green,
                  paddingVertical: 6,
                  marginBottom: 16,
                }}
                autoFocus
              />
              <View className="flex-row gap-x-3">
                <TouchableOpacity
                  onPress={() => {
                    setDisplayName(
                      user?.user_metadata?.full_name ||
                        user?.user_metadata?.name ||
                        '',
                    );
                    setIsEditing(false);
                  }}
                  className="flex-1 border border-light_grey rounded-xl py-3 items-center"
                >
                  <Text className="text-grey_text font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl py-3 items-center"
                  style={{ backgroundColor: colors.light_green }}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.dark_bg} />
                  ) : (
                    <Text style={{ color: colors.dark_bg, fontWeight: 'bold' }}>
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-off_white text-base">
                {displayName || 'Not set'}
              </Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <MaterialDesignIcons
                  name="pencil-outline"
                  size={20}
                  color={colors.grey_text}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Email Card */}
        <View className="bg-dark_grey rounded-2xl p-5">
          <View className="flex-row items-center mb-2">
            <MaterialDesignIcons
              name="email-outline"
              size={16}
              color={colors.light_green}
            />
            <Text className="text-grey_text text-xs font-semibold uppercase ml-2 tracking-widest">
              Email
            </Text>
          </View>
          <Text className="text-off_white text-base">{email}</Text>
        </View>

        {/* Member Since Card */}
        <View className="bg-dark_grey rounded-2xl p-5">
          <View className="flex-row items-center mb-2">
            <MaterialDesignIcons
              name="calendar-outline"
              size={16}
              color={colors.light_green}
            />
            <Text className="text-grey_text text-xs font-semibold uppercase ml-2 tracking-widest">
              Member Since
            </Text>
          </View>
          <Text className="text-off_white text-base">{memberSince}</Text>
        </View>

        {/* Sign-in Provider Card */}
        <View className="bg-dark_grey rounded-2xl p-5">
          <View className="flex-row items-center mb-2">
            <MaterialDesignIcons
              name="shield-account-outline"
              size={16}
              color={colors.light_green}
            />
            <Text className="text-grey_text text-xs font-semibold uppercase ml-2 tracking-widest">
              Signed In With
            </Text>
          </View>
          <Text className="text-off_white text-base">{provider}</Text>
        </View>

        {/* Danger Zone */}
        <View className="mt-8 mb-4">
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This will permanently remove all your habits and progress. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.rpc('delete_user');
                        
                        if (error) {
                          Alert.alert('Error', 'Failed to delete account data: ' + error.message);
                        } else {
                          await supabase.auth.signOut();
                        }
                    },
                  },
                ],
              );
            }}
            className="bg-dark_grey border border-red rounded-2xl p-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <MaterialDesignIcons
                name="account-remove-outline"
                size={24}
                color={colors.red}
              />
              <Text className="text-red text-base font-bold ml-3">
                Delete Account
              </Text>
            </View>
            <MaterialDesignIcons
              name="chevron-right"
              size={24}
              color={colors.red}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileInfoScreen;
