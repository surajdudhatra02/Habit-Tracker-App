import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { View, Text, ScrollView } from 'react-native';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Button, Chart, SuccessRate } from '../components';


type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = ({ navigation }: Props) => {
  const addIcon = <MaterialDesignIcons name="plus-circle-outline" size={18} color={'white'} />

  return (
    <ScrollView 
      className="flex-1 bg-dark_bg"
      showsVerticalScrollIndicator={false}
      bounces={true}
      scrollEventThrottle={16}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <View className="p-6">
        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-green mb-2">Home, User !!</Text>
          <Text className="text-grey_text text-base">
            You're on a roll! Keep up the great work.
          </Text>
        </View>

        {/* Today's Habit Card */}
        <View className="bg-dark_grey p-5 rounded-xl mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="p-4 bg-light_grey rounded-xl mr-4">
                <FontAwesome name="snowflake-o" size={30} color="white" />
              </View>
              
              <View className="flex-1">
                <Text className="text-xl text-white font-semibold mb-1">
                  Today's Habit
                </Text>
                <Text className="text-grey_text text-sm">
                  Meditate for 10 minutes
                </Text>
              </View>
            </View>

            <Button
              text="Check-in"
              className="bg-green px-4 py-2 rounded-lg ml-3"
              textClassName="text-dark_bg font-bold text-sm"
              onPress={() => console.log('Check-in')}
            />
          </View>
        </View>

        {/* Progress Section */}
        <View className="mb-6">
          <Text className="text-white text-2xl font-bold mb-4">Progress</Text>
          
          <View className="bg-dark_grey p-4 rounded-xl">
            <Chart />
          </View>
          
          {/* Success Rate Box */}
          <SuccessRate percentage={85} />
        </View>

        {/* Add Habit Button */}
        <View className="mb-6">
          <Button
            icon={addIcon}
            text="Add/Change Habit"
            className="bg-dark_green px-6 py-4 rounded-xl flex-row items-center justify-center"
            textClassName="text-white font-bold text-base ml-2"
            onPress={() => console.log('Add/Change Habit')}
          />
        </View>
      </View>
    </ScrollView>
  );
};


export default HomeScreen;