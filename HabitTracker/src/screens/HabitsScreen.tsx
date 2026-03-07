import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import React, { useState } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Button, Divider, Popup } from '../components';
import { colors } from '../constants';
import { useHabits } from '../hooks';
import { Habit } from '../types';

const HabitsScreen = ({ navigation }) => {
  const { habits, loading, deleteHabit, fetchHabits } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const addIcon = (
    <MaterialDesignIcons
      name="plus-circle-outline"
      size={18}
      color={colors.black}
    />
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchHabits();
    } catch (error) {
      console.error('Error refreshing habits:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePress = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHabit) return;
    setDeleting(true);
    try {
      await deleteHabit(selectedHabit.id);
      Alert.alert('Success', 'Habit deleted successfully');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to delete habit. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeletePopup(false);
      setSelectedHabit(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <MaterialDesignIcons
        name="clipboard-list-outline"
        size={72}
        color={colors.light_grey}
      />
      <Text className="text-off_white text-2xl font-bold mt-6 mb-2">
        No Habits Yet
      </Text>
      <Text className="text-grey_text text-base text-center px-8 leading-6">
        Start building better habits. Add your first habit to get started.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 px-6 bg-dark_bg">
      <View className="pt-4  flex-row justify-between shadow-white drop-shadow-2xl">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-light_green mb-1">
            My Habits
          </Text>
          <Text className="text-grey_text text-base">
            {habits.length > 0
              ? `You have ${habits.length} active habit${
                  habits.length !== 1 ? 's' : ''
                }`
              : 'Build your daily routine'}
          </Text>
        </View>

        <View>
          <Button
            icon={addIcon}
            text="Add Habit"
            className="bg-light_green px-4 py-4 rounded-xl flex-row items-center justify-center"
            textClassName="text-black font-bold text-base ml-2"
            onPress={() => navigation.navigate('NewHabit')}
          />
        </View>
      </View>
      <ScrollView
        className="flex-1 py-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.light_green}
            colors={[colors.light_green]}
          />
        }
      >
        <View>
          {/* Habits List */}
          {loading && habits.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <MaterialDesignIcons
                name="loading"
                size={40}
                color={colors.light_green}
              />
              <Text className="text-grey_text text-base mt-4">
                Loading habits...
              </Text>
            </View>
          ) : habits.length === 0 ? (
            <EmptyState />
          ) : (
            <View className="bg-dark_grey rounded-xl overflow-hidden">
              {habits.map((habit, index) => (
                <React.Fragment key={habit.id}>
                  {index > 0 && <Divider />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="p-4"
                    // onPress={() =>
                    //   navigation.navigate('HabitDetail', { habitId: habit.id })
                    // } // optional
                  >
                    <View className="flex-row items-start justify-between">
                      {/* Left: Icon + Info */}
                      <View className="flex-row items-start flex-1 mr-3">
                        <View className="bg-light_grey p-3 rounded-xl mr-4 mt-0.5">
                          <MaterialDesignIcons
                            name="repeat"
                            size={22}
                            color={colors.light_green}
                          />
                        </View>

                        <View className="flex-1">
                          <Text className="text-off_white text-lg font-semibold mb-1">
                            {habit.name}
                          </Text>

                          {habit.description ? (
                            <Text
                              className="text-grey_text text-sm mb-2 leading-5"
                              numberOfLines={2}
                            >
                              {habit.description}
                            </Text>
                          ) : null}

                          {habit.goal ? (
                            <View className="flex-row items-center mb-2">
                              <MaterialDesignIcons
                                name="flag-outline"
                                size={14}
                                color={colors.light_green}
                              />
                              <Text className="text-light_green text-sm ml-1">
                                {habit.goal}
                              </Text>
                            </View>
                          ) : null}

                          <View className="flex-row items-center">
                            <MaterialDesignIcons
                              name="calendar-outline"
                              size={13}
                              color={colors.grey_text}
                            />
                            <Text className="text-grey_text text-xs ml-1">
                              Since {formatDate(habit.created_at)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Delete Button */}
                      <TouchableOpacity
                        onPress={() => handleDeletePress(habit)}
                        className="p-2 mt-0.5"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialDesignIcons
                          name="trash-can-outline"
                          size={20}
                          color={colors.grey_text}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        <Popup
          visible={showDeletePopup}
          type="warning"
          title="Delete Habit?"
          message={`Are you sure you want to delete "${selectedHabit?.name}"? This action cannot be undone.`}
          showCancel={true}
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeletePopup(false);
            setSelectedHabit(null);
          }}
        />
      </ScrollView>
    </View>
  );
};

export default HabitsScreen;
