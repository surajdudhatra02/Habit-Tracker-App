import { View, Text, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { Button, Divider, Input, Popup, TimePicker } from '../components';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import { useHabits } from '../hooks';

type Reminder = {
  id: string;
  time: Date;
};

const NewHabitScreen = ({ navigation }) => {
  const { createHabit } = useHabits();
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const handleAddReminder = () => {
    setShowTimePicker(true);
  };

  const handleTimeSelected = (time: Date) => {
    const newReminder: Reminder = {
      id: `reminder_${Date.now()}`,
      time: time,
    };
    setReminders(prev => [...prev, newReminder]);
    setShowTimePicker(false);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTimeForDB = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`; // Returns "09:00", "14:30", etc.
  };

  const validateAndShowConfirm = () => {
    // Validate habit name
    if (!habitName.trim()) {
      setErrorMessage('Please enter a habit name to continue.');
      setShowErrorPopup(true);
      return;
    }

    // Validate at least one reminder
    if (reminders.length === 0) {
      setErrorMessage('Please add at least one reminder time.');
      setShowErrorPopup(true);
      return;
    }

    // All validations passed, show confirmation
    setShowConfirmPopup(true);
  };

  const saveNewHabit = async () => {
    setLoading(true);

    try {
      // Convert reminders to HH:MM format for database
      const reminderTimes = reminders.map(r => formatTimeForDB(r.time));

      await createHabit({
        name: habitName.trim(),
        description: description.trim() || undefined,
        goal: goal.trim() || undefined,
        reminders: reminderTimes, // ["09:00", "14:30"]
      });

      setShowConfirmPopup(false);

      Alert.alert('Success', 'Habit created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error saving habit:', error);
      setShowConfirmPopup(false);
      setErrorMessage('Failed to save habit. Please try again.');
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const addIcon = (
    <MaterialDesignIcons
      name="plus-circle-outline"
      size={18}
      color={colors.off_white}
    />
  );

  const removeIcon = (
    <MaterialDesignIcons
      name="close-circle"
      size={24}
      color={colors.light_grey}
    />
  );

  return (
    <>
      <ScrollView className="bg-dark_bg flex-1">
        <View className="flex-1 p-6 gap-6">
          {/* Habit Details */}
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

          {/* Reminders Section */}
          <View>
            <Text className="text-off_white text-2xl font-bold mb-4">
              Reminders
            </Text>

            {/* Only show background when reminders exist */}
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
                      <Button
                        onPress={() => handleRemoveReminder(reminder.id)}
                        className="p-2"
                        text={removeIcon}
                      ></Button>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}

            <Button
              text="Add time"
              className="border-light_grey border-2 rounded-xl flex-row items-center justify-center py-3"
              textClassName="text-off_white font-bold text-base ml-2"
              icon={addIcon}
              onPress={handleAddReminder}
            />
          </View>

          {/* Goals Section */}
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

          {/* Time Picker Modal */}
          {showTimePicker && (
            <TimePicker
              value={new Date()}
              onChange={handleTimeSelected}
              onDismiss={() => setShowTimePicker(false)}
            />
          )}

          {/* Save Button */}
          <Button
            text="Save Habit"
            className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center mt-4"
            textClassName="text-black font-bold text-base"
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

        {/* Confirmation Popup */}
        <Popup
          visible={showConfirmPopup}
          type="warning"
          title="Save Habit?"
          message="Are you sure you want to save this habit?"
          showCancel={true}
          confirmText="Yes, Save"
          cancelText="Cancel"
          onConfirm={saveNewHabit}
          onCancel={() => setShowConfirmPopup(false)}
        />
      </ScrollView>
    </>
  );
};

export default NewHabitScreen;
