import { View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Button, Popup } from '../components';
import { colors } from '../constants';
import MotionView from '../components/MotionView';
import { useHabitStore } from '../store';
import { Habit, HabitReminder } from '../types';
import { formatDate, formatTime, daysSince, getHabitIcon } from '../utils';
import { showErrorToast } from '../utils/toast';

const HabitDetailsScreen = ({ route, navigation }: any) => {
  const deleteHabit = useHabitStore(s => s.deleteHabit);
  const getHabitReminders = useHabitStore(s => s.getHabitReminders);

  const [habit, setHabit] = useState<Habit>(route.params.habit);
  const [reminders, setReminders] = useState<HabitReminder[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadReminders = useCallback(
    async (habitId?: string) => {
      try {
        const data = await getHabitReminders(habitId || habit.id);
        setReminders(data);
      } catch {
        showErrorToast(
          'Unable to load reminders',
          'Please reopen this habit to retry.',
        );
      }
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
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 36 }}
      >
        <MotionView>
          <Text className="text-grey_text text-xs font-semibold tracking-widest mb-5">
            YOUR ROUTINE
          </Text>
          <View className="flex-row items-start mb-5">
            <View className="bg-dark_green rounded-2xl p-4 mr-4">
              <MaterialDesignIcons
                name={getHabitIcon(habit.name) as any}
                size={28}
                color={colors.light_green}
              />
            </View>
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold leading-9">
                {habit.name}
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="w-1.5 h-1.5 rounded-full bg-light_green mr-2" />
                <Text className="text-grey_text text-sm">Daily habit</Text>
              </View>
            </View>
          </View>
          {habit.description ? (
            <Text className="text-grey_text text-base leading-6 mb-6">
              {habit.description}
            </Text>
          ) : null}
        </MotionView>
        <MotionView delay={60} className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-dark_grey border border-card_border rounded-3xl p-5">
            <MaterialDesignIcons
              name="calendar-outline"
              size={20}
              color={colors.light_green}
            />
            <Text className="text-white text-3xl font-bold mt-4">
              {daysSince(habit.created_at)}
            </Text>
            <Text className="text-grey_text text-xs mt-1">Days active</Text>
          </View>
          <View className="flex-1 bg-dark_grey border border-card_border rounded-3xl p-5">
            <MaterialDesignIcons
              name="bell-outline"
              size={20}
              color={colors.light_green}
            />
            <Text className="text-white text-3xl font-bold mt-4">
              {reminders.filter(r => r.is_enabled).length}
            </Text>
            <Text className="text-grey_text text-xs mt-1">
              Active reminders
            </Text>
          </View>
        </MotionView>

        {habit.goal ? (
          <MotionView
            delay={100}
            className="bg-dark_grey border border-card_border rounded-3xl p-5 mb-6"
          >
            <View className="flex-row items-center mb-3">
              <MaterialDesignIcons
                name="flag-outline"
                size={18}
                color={colors.light_green}
              />
              <Text className="text-light_green text-xs font-semibold tracking-widest ml-2">
                THE GOAL
              </Text>
            </View>
            <Text className="text-white text-base leading-6">{habit.goal}</Text>
          </MotionView>
        ) : null}

        {reminders.length > 0 && (
          <MotionView delay={140} className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">
                A little nudge
              </Text>
              <Text className="text-grey_text text-xs">Every day</Text>
            </View>
            <View className="bg-dark_grey border border-card_border rounded-3xl px-5 py-1">
              {reminders.map((reminder, index) => (
                <View
                  key={reminder.id}
                  className={`flex-row items-center justify-between py-4 ${
                    index < reminders.length - 1
                      ? 'border-b border-card_border'
                      : ''
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className="bg-icon_bg p-2.5 rounded-xl mr-3">
                      <MaterialDesignIcons
                        name="clock-outline"
                        size={18}
                        color={colors.light_green}
                      />
                    </View>
                    <Text className="text-white text-base font-semibold">
                      {formatTime(reminder.reminder_time)}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1.5 rounded-full ${reminder.is_enabled ? 'bg-dark_green' : 'bg-light_grey'}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${reminder.is_enabled ? 'text-light_green' : 'text-grey_text'}`}
                    >
                      {reminder.is_enabled ? 'On' : 'Off'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </MotionView>
        )}

        <Text className="text-white text-lg font-bold mb-3">The details</Text>
        <View className="bg-dark_grey border border-card_border rounded-3xl p-5 mb-6">
          <View className="flex-row items-start mb-5">
            <MaterialDesignIcons
              name="calendar-plus"
              size={19}
              color={colors.grey_text}
            />
            <View className="flex-1 ml-3">
              <Text className="text-grey_text text-xs mb-1">Started</Text>
              <Text className="text-white text-sm leading-5">
                {formatDate(habit.created_at)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <MaterialDesignIcons
              name="calendar-edit"
              size={19}
              color={colors.grey_text}
            />
            <View className="flex-1 ml-3">
              <Text className="text-grey_text text-xs mb-1">Last updated</Text>
              <Text className="text-white text-sm leading-5">
                {formatDate(habit.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Button
            text="Edit Habit"
            accessibilityLabel="Edit this habit"
            className="bg-light_green rounded-2xl py-4"
            textClassName="text-black font-bold text-base"
            icon={
              <MaterialDesignIcons
                name="pencil-outline"
                size={19}
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
            accessibilityLabel="Delete this habit"
            className="border border-card_border rounded-2xl py-4"
            textClassName="text-sm font-semibold text-red"
            onPress={() => setShowDeletePopup(true)}
          />
        </View>
      </ScrollView>
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
    </View>
  );
};

export default HabitDetailsScreen;
