import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Button, Divider, Input, TimePicker } from '../components';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import { useHabitStore } from '../store';
import { Habit } from '../types';
import { showErrorToast, showSuccessToast } from '../utils/toast';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Routes } from '../navigation/route';

type Reminder = {
  id: string;
  time: Date;
};

type Props = NativeStackScreenProps<RootStackParamList, Routes.NewHabit>;

const NewHabitScreen = ({ navigation, route }: Props) => {
  const existingHabit: Habit | undefined = route?.params?.habit;
  const isEditMode = !!existingHabit;

  const createHabit = useHabitStore(s => s.createHabit);
  const updateHabit = useHabitStore(s => s.updateHabit);
  const getHabitReminders = useHabitStore(s => s.getHabitReminders);

  const [habitName, setHabitName] = useState(existingHabit?.name || '');
  const [description, setDescription] = useState(
    existingHabit?.description || '',
  );
  const [goal, setGoal] = useState(existingHabit?.goal || '');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Habit' : 'New Habit',
    });

    if (isEditMode) {
      getHabitReminders(existingHabit!.id).then(data => {
        setReminders(
          data.map(r => ({
            id: r.id,
            time: (() => {
              const [h, m] = r.reminder_time.split(':');
              const d = new Date();
              d.setHours(+h, +m, 0, 0);
              return d;
            })(),
          })),
        );
      });
    }
  }, [getHabitReminders]);

  const handleAddReminder = () => setShowTimePicker(true);

  const handleTimeSelected = (time: Date) => {
    const newReminder: Reminder = {
      id: `reminder_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      time,
    };
    setReminders(prev => [...prev, newReminder]);
    setShowTimePicker(false);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatTimeForDB = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const validateAndSave = () => {
    if (!habitName.trim()) {
      showErrorToast(
        'Validation Error',
        'Please enter a habit name to continue.',
      );
      return;
    }
    if (reminders.length === 0) {
      showErrorToast(
        'Validation Error',
        'Please add at least one reminder time.',
      );
      return;
    }
    handleSave();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const reminderTimes = reminders.map(r => formatTimeForDB(r.time));

      if (isEditMode) {
        await updateHabit(existingHabit!.id, {
          name: habitName.trim(),
          description: description.trim() || undefined,
          goal: goal.trim() || undefined,
          reminders: reminderTimes,
        });
        showSuccessToast('Updated', 'Habit updated successfully!');

        const updatedHabit = {
          ...existingHabit,
          name: habitName.trim(),
          description: description.trim() || undefined,
          goal: goal.trim() || undefined,
          updated_at: new Date().toISOString(),
        };
        route.params?.onUpdate?.(updatedHabit);
        navigation.goBack();
      } else {
        await createHabit({
          name: habitName.trim(),
          description: description.trim() || undefined,
          goal: goal.trim() || undefined,
          reminders: reminderTimes,
        });
        showSuccessToast('Success', 'Habit created successfully!');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Error saving habit:', error);
      showErrorToast('Error', 'Failed to save habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView className="bg-dark_bg flex-1">
        <View className="flex-1 p-6 gap-6">
          <View className="gap-4">
            <Input
              placeholder="Enter Habit Name"
              lines={1}
              value={habitName}
              onChangeText={setHabitName}
            />
            <Input
              placeholder="Enter Description (optional)"
              lines={5}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View>
            <Text className="text-off_white text-2xl font-bold mb-4">
              Reminders
            </Text>

            {reminders.length > 0 && (
              <View className="bg-dark_grey rounded-2xl p-4 mb-4">
                {reminders.map((reminder, index) => (
                  <React.Fragment key={reminder.id}>
                    {index > 0 && <Divider />}
                    <View className="flex-row items-center justify-between py-3">
                      <View className="flex-row items-center flex-1">
                        <MaterialDesignIcons
                          name="clock-outline"
                          size={24}
                          color={colors.off_white}
                        />
                        <View className="ml-5">
                          <Text className="text-off_white text-lg font-semibold">
                            {formatTime(reminder.time)}
                          </Text>
                          <Text className="text-light_green text-sm mt-1">
                            Daily Reminder
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveReminder(reminder.id)}
                        className="p-2"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialDesignIcons
                          name="close-circle"
                          size={24}
                          color={colors.light_grey}
                        />
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}

            <Button
              text="Add time"
              className="border-light_grey border-2 rounded-2xl py-3"
              textClassName="text-off_white font-bold text-base"
              icon={
                <MaterialDesignIcons
                  name="plus-circle-outline"
                  size={18}
                  color={colors.off_white}
                />
              }
              onPress={handleAddReminder}
            />
          </View>

          <View>
            <Text className="text-off_white text-2xl font-bold mb-4">
              Goals
            </Text>
            <Input
              placeholder="Enter goal - e.g. 30 days in a row"
              lines={3}
              value={goal}
              onChangeText={setGoal}
            />
          </View>

          {showTimePicker && (
            <TimePicker
              value={new Date()}
              onChange={handleTimeSelected}
              onDismiss={() => setShowTimePicker(false)}
            />
          )}

          <Button
            text={isEditMode ? 'Update Habit' : 'Save Habit'}
            className="bg-light_green px-6 py-4 rounded-2xl mt-4"
            textClassName="text-black font-bold text-base"
            loading={loading}
            loadingColor={colors.black}
            onPress={validateAndSave}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default NewHabitScreen;
