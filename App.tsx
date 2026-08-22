import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ShapeKingdomScreen from './src/screens/ShapeKingdomScreen';
import CountingForestScreen from './src/screens/CountingForestScreen';
import PatternPathScreen from './src/screens/PatternPathScreen';
import LogicLandScreen from './src/screens/LogicLandScreen';
import MemoryMeadowScreen from './src/screens/MemoryMeadowScreen';
import PuzzlePeakScreen from './src/screens/PuzzlePeakScreen';
import UnlockScreen from './src/screens/UnlockScreen'; // we'll create this next

// ✅ Import the new screens
import AbcScreen from './src/screens/AbcScreen';
import CountingScreen from './src/screens/CountingScreen';

export type RootStackParamList = {
  Home: undefined;
  ShapeKingdom: undefined;
  CountingForest: undefined;
  PatternPath: undefined;
  LogicLand: undefined;
  MemoryMeadow: undefined;
  PuzzlePeak: undefined;
  Abc: undefined;      // ✅ added – matches HomeScreen navigation
  Counting: undefined; // ✅ added
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUnlock = async () => {
      try {
        const unlocked = await AsyncStorage.getItem('isUnlocked');
        setIsUnlocked(unlocked === 'true');
      } catch (error) {
        console.error('Failed to read unlock status', error);
        setIsUnlocked(false); // fail safe – ask for password
      }
    };
    checkUnlock();
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  if (isUnlocked === null) {
    // Still checking – show a loading spinner
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF9A8B" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isUnlocked) {
    return (
      <SafeAreaProvider>
        <UnlockScreen onUnlock={handleUnlock} />
      </SafeAreaProvider>
    );
  }

  // App is unlocked – show the main navigation
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ShapeKingdom"
            component={ShapeKingdomScreen}
            options={{ title: 'Shape Kingdom' }}
          />
          <Stack.Screen
            name="CountingForest"
            component={CountingForestScreen}
            options={{ title: 'Counting Forest' }}
          />
          <Stack.Screen
            name="PatternPath"
            component={PatternPathScreen}
            options={{ title: 'Pattern Path' }}
          />
          <Stack.Screen
            name="LogicLand"
            component={LogicLandScreen}
            options={{ title: 'Logic Land' }}
          />
          <Stack.Screen
            name="MemoryMeadow"
            component={MemoryMeadowScreen}
            options={{ title: 'Memory Meadow' }}
          />
          <Stack.Screen
            name="PuzzlePeak"
            component={PuzzlePeakScreen}
            options={{ title: 'Puzzle Peak' }}
          />

          {/* ✅ New screens */}
          <Stack.Screen
            name="ABC"
            component={AbcScreen}
            options={{ title: 'ABC Learning' }}
          />
          <Stack.Screen
            name="Counting"
            component={CountingScreen}
            options={{ title: 'Counting' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}