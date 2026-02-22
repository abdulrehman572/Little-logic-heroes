import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ShapeKingdomScreen from '../screens/ShapeKingdomScreen';
import CountingForestScreen from '../screens/CountingForestScreen';
import PatternPathScreen from '../screens/PatternPathScreen';
import LogicLandScreen from '../screens/LogicLandScreen';
import MemoryMeadowScreen from '../screens/MemoryMeadowScreen';
import PuzzlePeakScreen from '../screens/PuzzlePeakScreen';

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

export default function AppNavigator() {
  return (
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
  );
}