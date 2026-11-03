import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { BarChart, CurveType, LineChart } from 'react-native-gifted-charts';
import { colors } from '../constants';
import { CompletionDay } from '../hooks';

export const HomeBarChart = ({ data }: { data: CompletionDay[] }) => {
  const barData = data.map(d => ({
    value: d.completed_habits,
    label: d.day_label,
    frontColor: colors.light_green,
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
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 102, 160);
  const chartData = data.map((day, index) => ({
    value: day.completion_rate,
    label:
      index === 0 || index === data.length - 1 || index % 7 === 0
        ? new Date(`${day.day_date}T12:00:00`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : '',
  }));

  return (
    <View className="overflow-hidden">
      <LineChart
        data={chartData.length > 0 ? chartData : [{ value: 0, label: '' }]}
        width={chartWidth}
        height={140}
        spacing={chartWidth / Math.max(chartData.length - 1, 1)}
        initialSpacing={0}
        endSpacing={0}
        color={colors.light_green}
        thickness={2}
        areaChart
        startFillColor={colors.light_green}
        endFillColor={colors.dark_grey}
        startOpacity={0.18}
        endOpacity={0.02}
        yAxisThickness={0}
        xAxisThickness={0}
        curveType={CurveType.QUADRATIC}
        hideRules
        hideDataPoints
        hideYAxisText
        curved
        disableScroll
        maxValue={100}
        noOfSections={4}
        xAxisLabelTextStyle={{ color: colors.grey_text, fontSize: 8 }}
        labelsExtraHeight={12}
      />
    </View>
  );
};
