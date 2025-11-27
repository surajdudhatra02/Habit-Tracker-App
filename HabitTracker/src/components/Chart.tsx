import { View } from 'react-native';
import { BarChart, CurveType, LineChart } from 'react-native-gifted-charts';

export const HomeBarChart = () => {
  const barData = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }];

  return (
    <>
      <BarChart
        data={barData}
        barWidth={30}
        frontColor="skyblue"
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
      />
    </>
  );
};

export const ProgressCurveChart = () => {
  const barData = [
    { value: 15, label: 'Mon' },
    { value: 30, label: 'Tue' },
    { value: 26, label: 'Wed' },
    { value: 50, label: 'Thu' },
    { value: 50, label: 'Fri' },
    { value: 30, label: 'Sat' },
    { value: 10, label: 'Sun' },
  ];
  return (
    <View className="-ml-4">
      <LineChart
        data={barData}
        color={'#a5c9a7'}
        yAxisThickness={0}
        xAxisThickness={0}
        curveType={CurveType.QUADRATIC}
        hideRules
        hideDataPoints
        hideYAxisText
        curved
        isAnimated
        xAxisLabelTextStyle={{
          color: '#949494',
        }}
      />
    </View>
  );
};
