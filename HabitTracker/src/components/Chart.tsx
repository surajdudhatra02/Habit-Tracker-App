import { View } from 'react-native';
import { BarChart, CurveType, LineChart } from 'react-native-gifted-charts';
import { colors } from '../constants';
import { CompletionDay } from '../hooks';

export const HomeBarChart = () => {
  const barData = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }];

  return (
    <>
      <BarChart
        data={barData}
        barWidth={30}
        frontColor={colors.light_green}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        yAxisTextStyle={{ color: colors.grey_text }}
      />
    </>
  );
};

export const ProgressCurveChart = ({ data }: { data: CompletionDay[] }) => {
  const chartData = data.map(d => ({
    value: d.completion_rate,
    label: d.day_label,
  }));

  return (
    <View className="-ml-4">
      <LineChart
        data={chartData.length > 0 ? chartData : [{ value: 0, label: '' }]}
        color={colors.light_green}
        yAxisThickness={0}
        xAxisThickness={0}
        curveType={CurveType.QUADRATIC}
        hideRules
        hideDataPoints
        hideYAxisText
        curved
        isAnimated
        maxValue={100}
        xAxisLabelTextStyle={{
          color: colors.grey_text,
        }}
      />
    </View>
  );
};
