import { NavigationContainer } from '@react-navigation/native';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './src/context';
import { ActivityIndicator, View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return <RootNavigator isLoggedIn={!!user} />;
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
