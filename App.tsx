import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ShapeKingdomScreen from './src/screens/ShapeKingdomScreen';
import CountingForestScreen from './src/screens/CountingForestScreen';
import PatternPathScreen from './src/screens/PatternPathScreen';
import LogicLandScreen from './src/screens/LogicLandScreen';
import MemoryMeadowScreen from './src/screens/MemoryMeadowScreen';
import PuzzlePeakScreen from './src/screens/PuzzlePeakScreen';

export type RootStackParamList = {
  Home: undefined;
  ShapeKingdom: undefined;
  CountingForest: undefined;
  PatternPath: undefined;
  LogicLand: undefined;
  MemoryMeadow: undefined;
  PuzzlePeak: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}