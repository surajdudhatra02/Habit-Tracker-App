import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import MotionView from '../components/MotionView';
import { useHabitStore } from '../store';
import { Habit } from '../types';
import { Button, EmptyState, Popup } from '../components';
import { HabitListSkeleton, SkeletonBlock } from '../components/Skeleton';
import { showErrorToast } from '../utils/toast';
import { getHabitIcon, daysSince } from '../utils';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Routes } from '../navigation/route';

type Props = NativeStackScreenProps<RootStackParamList, Routes.Habits>;

const HabitsScreen = ({ navigation }: Props) => {
  const habits = useHabitStore(s => s.habits);
  const loading = useHabitStore(s => s.loading);
  const fetchHabits = useHabitStore(s => s.fetchHabits);
  const deleteHabit = useHabitStore(s => s.deleteHabit);

  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auto refresh every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchHabits()
        .catch(error => {
          console.error('Error loading habits:', error);
          if (active)
            showErrorToast('Unable to load habits', 'Please try again.');
        })
        .finally(() => {
          if (active) setHasLoaded(true);
        });
      return () => {
        active = false;
      };
    }, [fetchHabits]),
  );

  const showSkeleton = (!hasLoaded || loading) && habits.length === 0;

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

  const handleDelete = async () => {
    if (!habitToDelete) return;
    setDeleting(true);
    try {
      await deleteHabit(habitToDelete.id);
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setDeleting(false);
      setShowDeletePopup(false);
      setHabitToDelete(null);
    }
  };

  return (
    <View className="flex-1 bg-dark_bg">
      <MotionView className="px-6 pt-5 pb-6">
        <Text className="text-grey_text text-xs font-semibold tracking-widest mb-2">
          YOUR DAILY PRACTICE
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text
              className="text-white text-3xl font-bold"
              style={{ letterSpacing: -1 }}
            >
              My habits
            </Text>
            {showSkeleton ? (
              <View className="mt-2">
                <SkeletonBlock width="90%" height={16} />
              </View>
            ) : (
              <Text className="text-grey_text text-sm mt-2">
                {habits.length > 0
                  ? `${habits.length} small step${habits.length !== 1 ? 's' : ''} toward a better you.`
                  : 'Your next chapter starts with one small step.'}
              </Text>
            )}
          </View>
          <Button
            text="New"
            accessibilityLabel="Create a new habit"
            className="bg-light_green px-4 py-3 rounded-full"
            textClassName="text-black font-bold text-sm"
            icon={
              <MaterialDesignIcons name="plus" size={18} color={colors.black} />
            }
            onPress={() => navigation.navigate(Routes.NewHabit)}
          />
        </View>
        {showSkeleton ? (
          <View
            className="flex-row mt-6 bg-dark_grey border border-card_border rounded-3xl p-4"
            accessibilityRole="progressbar"
            accessibilityLabel="Loading habit summary"
            accessibilityState={{ busy: true }}
          >
            {[0, 1, 2].map(index => (
              <View
                key={index}
                className={`flex-1 ${index > 0 ? 'border-l border-card_border pl-4' : ''}`}
              >
                <SkeletonBlock width={34} height={28} />
                <View className="mt-2">
                  <SkeletonBlock width="80%" height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          habits.length > 0 && (
            <View
              className="flex-row mt-6 bg-dark_grey border border-card_border p-4"
              style={{ borderRadius: 22 }}
            >
              <View className="flex-1">
                <Text className="text-light_green text-2xl font-bold">
                  {habits.length}
                </Text>
                <Text className="text-grey_text text-xs mt-1">
                  Active habits
                </Text>
              </View>
              <View className="flex-1 border-l border-card_border pl-4">
                <Text className="text-white text-2xl font-bold">
                  {Math.max(...habits.map(h => daysSince(h.created_at)), 0)}
                  <Text className="text-grey_text text-sm">d</Text>
                </Text>
                <Text className="text-grey_text text-xs mt-1">
                  Longest active
                </Text>
              </View>
              <View className="flex-1 border-l border-card_border pl-4">
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.light_green }}
                >
                  {habits.filter(h => h.goal).length}
                </Text>
                <Text className="text-grey_text text-xs mt-1">With a goal</Text>
              </View>
            </View>
          )
        )}
      </MotionView>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.light_green}
            colors={[colors.light_green]}
          />
        }
      >
        {showSkeleton ? (
          <HabitListSkeleton count={4} />
        ) : habits.length === 0 ? (
          <EmptyState onPress={() => navigation.navigate(Routes.NewHabit)} />
        ) : (
          <View style={{ gap: 12 }}>
            <Text className="text-grey_text text-xs font-semibold tracking-widest mb-1">
              ALL HABITS
            </Text>
            {habits.map((habit: Habit, index) => {
              const days = daysSince(habit.created_at);
              const icon = getHabitIcon(habit.name);
              const accent = [
                colors.light_green,
                colors.off_white,
                colors.light_green,
              ][index % 3];
              const iconBackground = [
                colors.icon_bg,
                colors.light_grey,
                colors.dark_green,
              ][index % 3];
              return (
                <MotionView key={habit.id} delay={Math.min(index, 4) * 50}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(Routes.HabitDetails, { habit })
                    }
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${habit.name}`}
                    className="bg-dark_grey border border-card_border p-4"
                    style={{ borderRadius: 22 }}
                  >
                    <View className="flex-row items-start">
                      <View
                        className="w-12 h-12 items-center justify-center mr-4"
                        style={{
                          backgroundColor: iconBackground,
                          borderRadius: 16,
                        }}
                      >
                        <MaterialDesignIcons
                          name={icon as any}
                          size={24}
                          color={accent}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-white text-base font-semibold"
                          numberOfLines={2}
                        >
                          {habit.name}
                        </Text>
                        {habit.description ? (
                          <Text
                            className="text-grey_text text-sm leading-5 mt-1"
                            numberOfLines={2}
                          >
                            {habit.description}
                          </Text>
                        ) : (
                          <Text className="text-grey_text text-sm mt-1">
                            A little progress, every day.
                          </Text>
                        )}
                        <View
                          className="flex-row flex-wrap items-center mt-3"
                          style={{ gap: 8 }}
                        >
                          <View className="flex-row items-center">
                            <MaterialDesignIcons
                              name="calendar-outline"
                              size={12}
                              color={colors.grey_text}
                            />
                            <Text className="text-grey_text text-xs ml-1">
                              {days} days active
                            </Text>
                          </View>
                          {habit.goal ? (
                            <View
                              className="flex-row items-center px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: colors.icon_bg,
                                maxWidth: 150,
                              }}
                            >
                              <MaterialDesignIcons
                                name="flag-outline"
                                size={11}
                                color={colors.light_green}
                              />
                              <Text
                                className="text-xs ml-1 flex-shrink"
                                numberOfLines={1}
                                style={{ color: colors.light_green }}
                              >
                                {habit.goal}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <View className="items-center ml-2">
                        <MaterialDesignIcons
                          name="chevron-right"
                          size={21}
                          color={colors.grey_text}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            setHabitToDelete(habit);
                            setShowDeletePopup(true);
                          }}
                          className="p-2 mt-3"
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${habit.name}`}
                          hitSlop={8}
                        >
                          <MaterialDesignIcons
                            name="trash-can-outline"
                            size={17}
                            color={colors.grey_text}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotionView>
              );
            })}
          </View>
        )}
      </ScrollView>
      <Popup
        visible={showDeletePopup}
        type="warning"
        title="Delete Habit?"
        message={`Are you sure you want to delete "${habitToDelete?.name}"? This action cannot be undone.`}
        showCancel={true}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeletePopup(false);
          setHabitToDelete(null);
        }}
      />
    </View>
  );
};

export default HabitsScreen;
