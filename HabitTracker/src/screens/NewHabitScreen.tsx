import { View, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Button, Divider, Input, CheckboxCard } from '../components';

const NewHabitScreen = ({}) => {
  const [reminders, setReminders] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });

  const handleReminderChange =
    (key: keyof typeof reminders) => (value: boolean) => {
      setReminders(prev => ({ ...prev, [key]: value }));
    };

  const saveNewHabit = () => {
    console.log('new habit save');
  };

  return (
    <ScrollView className="bg-dark_bg flex-1">
      <View className="flex-1 p-6 gap-6">
        <View className="gap-4 p-0">
          <Input placeholder="Enter Habit Name" lines={1} />
          <Input placeholder="Enter Description" lines={5} />
        </View>

        <View>
          <Text className="text-off_white text-2xl font-bold mb-4">
            Reminders
          </Text>

          <View className="bg-dark_grey rounded-xl p-4">
            <CheckboxCard
              icon="white-balance-sunny"
              label="Morning"
              time="8:00 AM"
              checked={reminders.morning}
              onValueChange={handleReminderChange('morning')}
            />

            <Divider />

            <CheckboxCard
              icon="white-balance-sunny"
              label="Afternoon"
              time="1:00 PM"
              checked={reminders.afternoon}
              onValueChange={handleReminderChange('afternoon')}
            />

            <Divider />

            <CheckboxCard
              icon="weather-night"
              label="Evening"
              time="7:00 PM"
              checked={reminders.evening}
              onValueChange={handleReminderChange('evening')}
            />
          </View>
        </View>

        <View>
          <Text className="text-off_white text-2xl font-bold mb-4">Goals</Text>

          <Input placeholder="Enter - e.g. 30 days in a row" lines={3} />
        </View>

        <Button
          text="Save Habit"
          className="bg-light_green px-6 py-4 rounded-xl flex-row items-center justify-center"
          textClassName="text-black font-bold text-base ml-2"
          onPress={saveNewHabit}
        />
      </View>
    </ScrollView>
  );
};

export default NewHabitScreen;
