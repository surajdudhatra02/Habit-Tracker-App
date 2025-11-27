import { View, Switch } from 'react-native';
import { useState } from 'react';

const ToggleSwitch = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View className="flex-1">
      <Switch
        trackColor={{ false: '#141414', true: '#a5c9a7' }}
        thumbColor={isEnabled ? '#F0F0F0' : '#949494'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
      />
    </View>
  );
};

export default ToggleSwitch;
