import { View } from 'react-native';
import { BarChart, CurveType, LineChart } from 'react-native-gifted-charts';
import { colors } from '../constants';
import { CompletionDay } from '../hooks';

export const HomeBarChart = ({ data }: { data: CompletionDay[] }) => {
  const barData = data.map(d => ({
    value: d.completed_habits,
    label: d.day_label,
    frontColor:
      d.completed_habits === d.total_habits && d.total_habits > 0
        ? colors.light_green // full completion — bright
        : colors.dark_green, // partial / zero — dimmer
  }));

  return (
    <>
      <BarChart
        data={barData.length > 0 ? barData : [{ value: 0 }]}
        barWidth={30}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        yAxisTextStyle={{ color: colors.grey_text }}
        xAxisLabelTextStyle={{ color: colors.grey_text }}
        isAnimated
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
