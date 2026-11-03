import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { Button, Divider, Input, TimePicker } from '../components';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import MotionView from '../components/MotionView';
import { useHabitStore } from '../store';
import { Habit } from '../types';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { newHabitId } from '../utils/ids';

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
  const createId = useRef<string | null>(null);
  if (!isEditMode && !createId.current) createId.current = newHabitId();

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
  const [remindersLoading, setRemindersLoading] = useState(isEditMode);
  const [reminderLoadFailed, setReminderLoadFailed] = useState(false);
  const [reminderLoadAttempt, setReminderLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    navigation.setOptions({
      title: isEditMode ? 'Edit Habit' : 'New Habit',
    });

    if (isEditMode) {
      setRemindersLoading(true);
      setReminderLoadFailed(false);
      getHabitReminders(existingHabit!.id)
        .then(data => {
          if (!active) return;
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
        })
        .catch(() => {
          if (!active) return;
          setReminderLoadFailed(true);
          showErrorToast(
            'Unable to load reminders',
            'Retry before saving changes.',
          );
        })
        .finally(() => {
          if (active) setRemindersLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [
    getHabitReminders,
    existingHabit,
    isEditMode,
    navigation,
    reminderLoadAttempt,
  ]);

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
    if (loading || remindersLoading || reminderLoadFailed) return;
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
        const result = await updateHabit(existingHabit!.id, {
          name: habitName.trim(),
          description: description.trim() || null,
          goal: goal.trim() || null,
          reminders: reminderTimes,
        });
        if (result.remindersSynced)
          showSuccessToast('Updated', 'Habit updated successfully!');
        else
          showErrorToast(
            'Habit updated',
            'Reminders could not be scheduled. Reopen the app to retry.',
          );
        route.params?.onUpdate?.(result.habit);
        navigation.goBack();
      } else {
        const result = await createHabit({
          id: createId.current!,
          name: habitName.trim(),
          description: description.trim() || undefined,
          goal: goal.trim() || undefined,
          reminders: reminderTimes,
        });
        if (result.remindersSynced)
          showSuccessToast('Success', 'Habit created successfully!');
        else
          showErrorToast(
            'Habit saved',
            'Reminders could not be scheduled. Reopen the app to retry.',
          );
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
    <ScrollView
      className="bg-dark_bg flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="p-6" style={{ gap: 28 }}>
        <MotionView>
          <Text className="text-grey_text text-xs font-semibold tracking-widest mb-2">
            {isEditMode ? 'MAKE IT YOURS' : 'ONE SMALL STEP'}
          </Text>
          <Text
            className="text-white text-3xl font-bold"
            style={{ letterSpacing: -1 }}
          >
            {isEditMode ? 'Refine your routine.' : 'Build a better day.'}
          </Text>
          <Text className="text-grey_text text-sm mt-2 leading-5">
            {isEditMode
              ? 'A routine that grows with you.'
              : 'Choose something small. Show up for it every day.'}
          </Text>
        </MotionView>

        <MotionView delay={50} style={{ gap: 20 }}>
          <View>
            <Text className="text-off_white text-sm font-semibold mb-3">
              Habit name
            </Text>
            <Input
              placeholder="e.g. Read a little every day"
              lines={1}
              value={habitName}
              onChangeText={setHabitName}
              accessibilityLabel="Habit name"
            />
            {!isEditMode && (
              <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
                {['Read', 'Meditate', 'Drink water'].map(suggestion => (
                  <TouchableOpacity
                    key={suggestion}
                    onPress={() => setHabitName(suggestion)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Use ${suggestion} as habit name`}
                    className="px-3 py-2 rounded-full border border-card_border"
                    style={
                      habitName === suggestion
                        ? {
                            backgroundColor: colors.dark_green,
                            borderColor: colors.light_green,
                          }
                        : undefined
                    }
                  >
                    <Text
                      className="text-grey_text text-xs"
                      style={
                        habitName === suggestion
                          ? { color: colors.light_green }
                          : undefined
                      }
                    >
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-off_white text-sm font-semibold">
                Your why
              </Text>
              <Text className="text-grey_text text-xs">Optional</Text>
            </View>
            <Input
              placeholder="What makes this habit meaningful to you?"
              lines={3}
              multiline
              value={description}
              onChangeText={setDescription}
              accessibilityLabel="Habit description"
              style={{ minHeight: 96 }}
            />
          </View>
        </MotionView>

        <MotionView delay={100}>
          <View className="flex-row items-center mb-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.icon_bg }}
            >
              <MaterialDesignIcons
                name="bell-outline"
                size={17}
                color={colors.light_green}
              />
            </View>
            <Text className="text-white text-lg font-semibold">
              A gentle nudge
            </Text>
          </View>
          <Text className="text-grey_text text-sm leading-5 mb-4">
            Set a daily reminder to make showing up a little easier.
          </Text>

          {reminders.length > 0 && (
            <View
              className="bg-dark_grey p-4 mb-3 border border-card_border"
              style={{ borderRadius: 22 }}
            >
              {reminders.map((reminder, index) => (
                <React.Fragment key={reminder.id}>
                  {index > 0 && <Divider />}
                  <View className="flex-row items-center justify-between py-3">
                    <View className="flex-row items-center flex-1">
                      <MaterialDesignIcons
                        name="clock-outline"
                        size={21}
                        color={colors.light_green}
                      />
                      <View className="ml-3">
                        <Text className="text-white text-lg font-semibold">
                          {formatTime(reminder.time)}
                        </Text>
                        <Text className="text-grey_text text-xs mt-1">
                          Every day
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveReminder(reminder.id)}
                      className="p-2"
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${formatTime(reminder.time)} reminder`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialDesignIcons
                        name="close"
                        size={20}
                        color={colors.grey_text}
                      />
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
          <Button
            text="Add time"
            className="border-card_border border rounded-2xl py-4 bg-dark_grey"
            textClassName="text-light_green font-semibold text-sm"
            icon={
              <MaterialDesignIcons
                name="plus"
                size={18}
                color={colors.light_green}
              />
            }
            onPress={handleAddReminder}
          />
        </MotionView>

        <MotionView delay={150}>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-off_white text-sm font-semibold">
              Set your intention
            </Text>
            <Text className="text-grey_text text-xs">Optional</Text>
          </View>
          <Input
            placeholder="e.g. Read 10 pages each day"
            lines={2}
            multiline
            value={goal}
            onChangeText={setGoal}
            accessibilityLabel="Habit goal"
            style={{ minHeight: 76 }}
          />
        </MotionView>

        {showTimePicker && (
          <TimePicker
            value={new Date()}
            onChange={handleTimeSelected}
            onDismiss={() => setShowTimePicker(false)}
          />
        )}
        <MotionView delay={180}>
          <Button
            text={isEditMode ? 'Update Habit' : 'Save Habit'}
            className="bg-light_green px-6 py-4 rounded-2xl"
            textClassName="text-black font-bold text-base"
            loading={loading}
            disabled={remindersLoading || reminderLoadFailed}
            loadingColor={colors.black}
            onPress={validateAndSave}
          />
          <Text className="text-grey_text text-xs text-center mt-3">
            Small steps. Lasting change.
          </Text>
          {reminderLoadFailed && (
            <Button
              text="Retry loading reminders"
              className="py-4 mt-2"
              textClassName="text-light_green text-sm font-semibold"
              onPress={() => setReminderLoadAttempt(attempt => attempt + 1)}
            />
          )}
        </MotionView>
      </View>
    </ScrollView>
  );
};

export default NewHabitScreen;
