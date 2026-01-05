import { View, Text, ScrollView } from 'react-native';
import { Button, CalendarComponent, ProgressCurveChart } from '../components';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';

const ProgressScreen = () => {
  const exportIcon = (
    <MaterialDesignIcons name="download" color={colors.light_green} size={18} />
  );
  const shareIcon = (
    <MaterialDesignIcons name="share" color={colors.black} size={18} />
  );

  return (
    <ScrollView className="bg-dark_bg flex-1">
      <View className="flex-1 p-6">
        {/* Daily Completion */}
        <View className="mb-6">
          <Text className="text-off_white text-2xl font-bold mb-4">
            Daily Completion
          </Text>

          <View className="bg-dark_grey p-4 rounded-xl">
            <CalendarComponent />
          </View>
        </View>

        {/* Weekly Trend - Chart */}
        <View className="mb-6">
          <Text className="text-off_white text-2xl font-bold mb-4">
            Weekly Trend
          </Text>

          <View className="bg-dark_grey p-4 rounded-xl">
            <>
              <Text className="text-white text-xl">Habit Completion</Text>
              <Text className="text-light_green text-3xl font-bold">85%</Text>
              <View className="flex-row items-center gap-5">
                <Text className="text-grey_text text-xl">Last 7 Days</Text>
                <View className="flex-row items-center gap-1">
                  <MaterialDesignIcons
                    name="trending-up"
                    size={18}
                    color={colors.light_green}
                  />
                  <Text className="text-light_green font-semibold text-xl">
                    +10%
                  </Text>
                </View>
              </View>
            </>

            <ProgressCurveChart />
          </View>
        </View>

        {/* Motivational Tip */}
        <View className="mb-6">
          <Text className="text-off_white text-2xl font-bold mb-4">
            Motivational Tip
          </Text>

          <View className="bg-dark_grey p-6 rounded-xl flex-row items-center gap-2">
            <MaterialDesignIcons
              name="lightbulb-outline"
              color={colors.light_green}
              size={30}
            />
            <Text className="text-grey_text italic text-lg flex-1">
              "Consistency is key. Small, daily actions lead to significant
              long-term results. Keep up the great work!"
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-4">
          <Button
            text="Export"
            className="rounded-lg border-light_green border flex-1"
            textClassName="text-light_green text-2xl font-medium"
            onPress={() => console.log('Export Progress')}
            icon={exportIcon}
          />
          <Button
            text="Share"
            className="rounded-lg bg-light_green flex-1"
            textClassName="text-black text-2xl font-medium"
            onPress={() => console.log('Share Progress')}
            icon={shareIcon}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;
