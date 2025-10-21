import { BarChart } from 'react-native-gifted-charts';

const Chart = () => {
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

export default Chart;
