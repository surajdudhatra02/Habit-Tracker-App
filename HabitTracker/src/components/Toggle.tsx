import { View, Switch } from 'react-native';
import { useState } from 'react';
import { colors } from '../constants';

const ToggleSwitch = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View className="flex-1">
      <Switch
        trackColor={{ false: colors.dark_bg, true: colors.light_green }}
        thumbColor={isEnabled ? colors.white : colors.grey_text}
        ios_backgroundColor={colors.dark_bg}
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
      />
    </View>
  );
};

export default ToggleSwitch;
