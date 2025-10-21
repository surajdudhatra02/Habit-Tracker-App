import { NavigationContainer } from '@react-navigation/native';
import { MainTabs } from './src/navigation/MainTabs';
import "./global.css";

function App() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

export default App;
