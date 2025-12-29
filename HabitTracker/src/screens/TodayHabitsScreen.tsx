import { View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { CheckboxCard } from '../components';

const TodaysHabit = [
  {
    id: 'Water',
    icon: 'water',
    description: 'Stay hydrated throughout the day.',
    label: 'Water',
    time: '8:00 AM, 12:00 PM, 4:00 PM',
    goal: '8 glasses per day'
  },
  {
    id: 'Meditation',
    icon: 'meditation',
    description: '10 minutes of mindfulness.',
    label: 'Meditation',
    time: '7:00 AM',
    goal: 'Daily streak'
  },
  {
    id: 'Read',
    icon: 'book-open-blank-variant-outline',
    description: 'Finish one chapter of a book.',
    label: 'Read',
    time: '9:00 PM',
    goal: '30 pages this week'
  },
];

const TodayHabitsScreen = () => {
  const [habits, setHabits] = useState({
    drinkWater: false,
    meditate: false,
    read: false,
  });

  const handleHabitChange = (key: keyof typeof habits) => (value: boolean) => {
    setHabits(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView className="bg-dark_bg flex-1">
      <View className="flex-1 p-6 gap-6">
        {TodaysHabit.map((habit, index) => (
          <View className="bg-dark_grey rounded-xl p-4" key={habit.id}>
            <CheckboxCard
              icon={habit.icon}
              label={habit.label}
              description={habit.description}
              time={habit.time}
              goal={habit.goal}
              checked={habits[habit.id]}
              onValueChange={handleHabitChange(habit.id)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default TodayHabitsScreen;
