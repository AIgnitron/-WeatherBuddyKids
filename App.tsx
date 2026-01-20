import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Tabs } from './src/navigation/Tabs';
import { useWeatherStore } from './src/store/useWeatherStore';
import { LoadingState } from './src/components/LoadingState';

export default function App() {
  const inited = useWeatherStore((s) => s.inited);
  const init = useWeatherStore((s) => s.init);

  useEffect(() => {
    init().catch(() => {
      // store handles errors
    });
  }, [init]);

  if (!inited) {
    return <LoadingState title="Weather Buddy" message="Waking up the clouds..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Tabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
