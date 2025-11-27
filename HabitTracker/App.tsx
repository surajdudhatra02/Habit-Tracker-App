import { NavigationContainer } from '@react-navigation/native';
import { MainTabs } from './src/navigation/MainTabs';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
