import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Button, Divider, Input, Popup, TimePicker } from '../components';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import { useHabits } from '../hooks';
import { Habit } from '../types';

type Reminder = {
  id: string;
  time: Date;
};

const NewHabitScreen = ({ navigation, route }: any) => {
  const existingHabit: Habit | undefined = route?.params?.habit;
  const isEditMode = !!existingHabit;

  const { createHabit, updateHabit, getHabitReminders } = useHabits();

  const [habitName, setHabitName] = useState(existingHabit?.name || '');
  const [description, setDescription] = useState(
    existingHabit?.description || '',
  );
  const [goal, setGoal] = useState(existingHabit?.goal || '');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

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
      id: `reminder_${Date.now()}`,
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

  const validateAndShowConfirm = () => {
    if (!habitName.trim()) {
      setErrorMessage('Please enter a habit name to continue.');
      setShowErrorPopup(true);
      return;
    }
    if (reminders.length === 0) {
      setErrorMessage('Please add at least one reminder time.');
      setShowErrorPopup(true);
      return;
    }
    setShowConfirmPopup(true);
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
        setShowConfirmPopup(false);
        Alert.alert('Updated', 'Habit updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Call the callback to update Details screen directly
              const updatedHabit = {
                ...existingHabit,
                name: habitName.trim(),
                description: description.trim() || undefined,
                goal: goal.trim() || undefined,
                updated_at: new Date().toISOString(),
              };
              route.params?.onUpdate?.(updatedHabit);
              navigation.goBack();
            },
          },
        ]);
      } else {
        await createHabit({
          name: habitName.trim(),
          description: description.trim() || undefined,
          goal: goal.trim() || undefined,
          reminders: reminderTimes,
        });
        setShowConfirmPopup(false);
        Alert.alert('Success', 'Habit created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving habit:', error);
      setShowConfirmPopup(false);
      setErrorMessage('Failed to save habit. Please try again.');
      setShowErrorPopup(true);
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
              <View className="bg-dark_grey rounded-xl p-4 mb-4">
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
              className="border-light_grey border-2 rounded-xl py-3"
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
            className="bg-light_green px-6 py-4 rounded-xl mt-4"
            textClassName="text-black font-bold text-base"
            loading={loading}
            loadingColor={colors.black}
            onPress={validateAndShowConfirm}
          />
        </View>

        <Popup
          visible={showErrorPopup}
          type="error"
          title="Oops!"
          message={errorMessage}
          confirmText="Got it"
          onConfirm={() => setShowErrorPopup(false)}
        />

        <Popup
          visible={showConfirmPopup}
          type="warning"
          title={isEditMode ? 'Update Habit?' : 'Save Habit?'}
          message={
            isEditMode
              ? `Save changes to "${habitName.trim()}"?`
              : 'Are you sure you want to save this habit?'
          }
          showCancel={true}
          confirmText={isEditMode ? 'Yes, Update' : 'Yes, Save'}
          cancelText="Cancel"
          onConfirm={handleSave}
          onCancel={() => setShowConfirmPopup(false)}
        />
      </ScrollView>
    </>
  );
};

export default NewHabitScreen;
