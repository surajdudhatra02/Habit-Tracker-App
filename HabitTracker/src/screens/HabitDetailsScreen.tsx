import { View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Button, Popup } from '../components';
import { colors } from '../constants';
import { useHabits } from '../hooks';
import { Habit, HabitReminder } from '../types';
import { formatDate, formatTime, daysSince } from '../utils';
import { showErrorToast } from '../utils/toast';

const HabitDetailsScreen = ({ route, navigation }: any) => {
  const { deleteHabit, getHabitReminders } = useHabits();

  const [habit, setHabit] = useState<Habit>(route.params.habit);
  const [reminders, setReminders] = useState<HabitReminder[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadReminders = useCallback(
    async (habitId?: string) => {
      const data = await getHabitReminders(habitId || habit.id);
      setReminders(data);
    },
    [getHabitReminders, habit.id],
  );

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  useEffect(() => {
    if (route.params?.habit) {
      setHabit(route.params.habit);
      loadReminders(route.params.habit.id);
    }
  }, [route.params?.habit, loadReminders]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteHabit(habit.id);
      navigation.goBack();
    } catch {
      showErrorToast('Error', 'Failed to delete habit. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeletePopup(false);
    }
  };

  return (
    <View className="flex-1 bg-dark_bg">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View className="mx-6 mt-6 bg-dark_grey rounded-2xl p-5">
          <View className="flex-row items-center mb-4">
            <View
              className="p-4 rounded-xl mr-4"
              style={{ backgroundColor: '#2a352b' }}
            >
              <MaterialDesignIcons
                name="repeat"
                size={28}
                color={colors.light_green}
              />
            </View>
            <View className="flex-1">
              <Text className="text-off_white text-2xl font-bold leading-7">
                {habit.name}
              </Text>
              <Text className="text-grey_text text-sm mt-1">Active Habit</Text>
            </View>
          </View>

          {habit.description ? (
            <View className="bg-light_grey rounded-xl p-4">
              <Text className="text-grey_text text-xs font-semibold uppercase mb-1 tracking-widest">
                Description
              </Text>
              <Text className="text-off_white text-base leading-6">
                {habit.description}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Goal */}
        {habit.goal ? (
          <View className="mx-6 mt-4 bg-dark_grey rounded-2xl p-5">
            <View className="flex-row items-center mb-3">
              <MaterialDesignIcons
                name="flag-outline"
                size={18}
                color={colors.light_green}
              />
              <Text className="text-light_green text-sm font-semibold uppercase ml-2 tracking-widest">
                Goal
              </Text>
            </View>
            <Text className="text-off_white text-base leading-6">
              {habit.goal}
            </Text>
          </View>
        ) : null}

        {/* Stats Row */}
        <View className="mx-6 mt-4 flex-row gap-x-3">
          <View className="flex-1 bg-dark_grey rounded-2xl p-4 items-center">
            <MaterialDesignIcons
              name="fire"
              size={26}
              color={colors.light_green}
            />
            <Text className="text-off_white text-xl font-bold mt-2">
              {daysSince(habit.created_at)}
            </Text>
            <Text className="text-grey_text text-xs mt-1 text-center">
              Days Active
            </Text>
          </View>

          <View className="flex-1 bg-dark_grey rounded-2xl p-4 items-center">
            <MaterialDesignIcons
              name="bell-outline"
              size={26}
              color={colors.light_green}
            />
            <Text className="text-off_white text-xl font-bold mt-2">
              {reminders.filter(r => r.is_enabled).length}
            </Text>
            <Text className="text-grey_text text-xs mt-1 text-center">
              Reminders
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="mx-6 mt-4 bg-dark_grey rounded-2xl p-5">
          <Text className="text-grey_text text-xs font-semibold uppercase mb-4 tracking-widest">
            Timeline
          </Text>
          <View className="flex-row items-center mb-4">
            <View className="bg-light_grey p-2 rounded-lg mr-3">
              <MaterialDesignIcons
                name="calendar-plus"
                size={16}
                color={colors.light_green}
              />
            </View>
            <View>
              <Text className="text-grey_text text-xs mb-0.5">Created</Text>
              <Text className="text-off_white text-sm font-medium">
                {formatDate(habit.created_at)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-light_grey p-2 rounded-lg mr-3">
              <MaterialDesignIcons
                name="calendar-edit"
                size={16}
                color={colors.light_green}
              />
            </View>
            <View>
              <Text className="text-grey_text text-xs mb-0.5">
                Last Updated
              </Text>
              <Text className="text-off_white text-sm font-medium">
                {formatDate(habit.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Reminders */}
        {reminders.length > 0 && (
          <View className="mx-6 mt-4 bg-dark_grey rounded-2xl p-5">
            <View className="flex-row items-center mb-4">
              <MaterialDesignIcons
                name="bell-ring-outline"
                size={18}
                color={colors.light_green}
              />
              <Text className="text-grey_text text-xs font-semibold uppercase ml-2 tracking-widest">
                Reminders
              </Text>
            </View>

            {reminders.map((reminder, index) => (
              <View
                key={reminder.id}
                className={`flex-row items-center justify-between py-3 ${
                  index < reminders.length - 1
                    ? 'border-b border-light_grey'
                    : ''
                }`}
              >
                <View className="flex-row items-center">
                  <View className="bg-light_grey p-2 rounded-lg mr-3">
                    <MaterialDesignIcons
                      name="clock-outline"
                      size={16}
                      color={colors.light_green}
                    />
                  </View>
                  <Text className="text-off_white text-base font-medium">
                    {formatTime(reminder.reminder_time)}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    reminder.is_enabled ? 'bg-dark_green' : 'bg-light_grey'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      reminder.is_enabled
                        ? 'text-light_green'
                        : 'text-grey_text'
                    }`}
                  >
                    {reminder.is_enabled ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Buttons */}
        <View className="px-6 pt-4 pb-8 gap-y-3 mt-4">
          <Button
            text="Edit Habit"
            className="bg-light_green rounded-2xl py-4"
            textClassName="text-black font-bold text-base"
            icon={
              <MaterialDesignIcons
                name="pencil-outline"
                size={20}
                color={colors.black}
              />
            }
            onPress={() =>
              navigation.navigate('NewHabit', {
                habit,
                onUpdate: (updatedHabit: Habit) => {
                  setHabit(updatedHabit);
                  loadReminders(updatedHabit.id);
                },
              })
            }
          />

          <Button
            text="Delete Habit"
            className="bg-dark_grey border border-light_grey rounded-2xl py-4"
            textClassName="text-base font-semibold text-red"
            icon={
              <MaterialDesignIcons
                name="trash-can-outline"
                size={20}
                color={colors.red}
              />
            }
            onPress={() => setShowDeletePopup(true)}
          />
        </View>

        <Popup
          visible={showDeletePopup}
          type="warning"
          title="Delete Habit?"
          message={`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`}
          showCancel={true}
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowDeletePopup(false)}
        />
      </ScrollView>
    </View>
  );
};

export default HabitDetailsScreen;
