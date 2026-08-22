// src/screens/PatternPathScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBoundary from '../components/ErrorBoundary';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

// ==================== COLORS ====================
const COLORS = {
  primary: '#FF9A8B',
  secondary: '#99E2D0',
  accent: '#FFD966',
  purple: '#C5A3FF',
  pink: '#FFB3C6',
  teal: '#6DD3CE',
  background: '#FFF3E0',
  surface: '#FFFFFF',
  text: '#2D4059',
  textLight: '#5C6B7E',
  success: '#A3D9A5',
  error: '#F4A2A2',
  gold: '#F9D56E',
  shadow: '#000000',
};

// ==================== SHAPE DATA ====================
const SHAPES = [
  { id: 1, name: "Circle", color: '#FFB347', emoji: "🔴" },
  { id: 2, name: "Square", color: '#6C9EBF', emoji: "🟦" },
  { id: 3, name: "Triangle", color: '#F4A261', emoji: "🔺" },
  { id: 4, name: "Star", color: '#E9B741', emoji: "⭐" },
  { id: 5, name: "Heart", color: '#E57373', emoji: "❤️" },
  { id: 6, name: "Oval", color: '#81A4C6', emoji: "🥚" },
  { id: 7, name: "Rectangle", color: '#B5A886', emoji: "🟦" },
  { id: 8, name: "Pentagon", color: '#C4A77D', emoji: "⬟" },
  { id: 9, name: "Hexagon", color: '#A3C4A2', emoji: "⬡" },
  { id: 10, name: "Octagon", color: '#D4A5A5', emoji: "🛑" },
  { id: 11, name: "Rhombus", color: '#B2A4D4', emoji: "💠" },
  { id: 12, name: "Trapezoid", color: '#A4C8D4', emoji: "📐" },
];

// ==================== LEVELS & QUESTIONS (120) ====================
// ==================== NEW LEVELS & QUESTIONS (120) ====================
// ==================== NEW LEVELS & QUESTIONS (120) ====================
const LEVELS = [
  {
    name: "Level 1",
    questions: [
      { id: 1, text: "What comes next? 🔴, 🔵, 🔴, 🔵, ?", options: [{id: 'A', label: '🔴'}, {id: 'B', label: '🔵'}, {id: 'C', label: '🟢'}], correct: 'A' },
      { id: 2, text: "Complete: 2, 4, 6, 8, ?", options: [{id: 'A', label: '9'}, {id: 'B', label: '10'}, {id: 'C', label: '12'}], correct: 'B' },
      { id: 3, text: "Next: 🟩, 🟩, 🟨, 🟩, 🟩, ?", options: [{id: 'A', label: '🟩'}, {id: 'B', label: '🟨'}, {id: 'C', label: '🟦'}], correct: 'B' },
      { id: 4, text: "Pattern: A, B, C, D, ?", options: [{id: 'A', label: 'E'}, {id: 'B', label: 'F'}, {id: 'C', label: 'G'}], correct: 'A' },
      { id: 5, text: "What follows? ●, ○, ●, ○, ?", options: [{id: 'A', label: '●'}, {id: 'B', label: '○'}, {id: 'C', label: '◐'}], correct: 'A' },
      { id: 6, text: "Complete: 1, 3, 5, 7, ?", options: [{id: 'A', label: '8'}, {id: 'B', label: '9'}, {id: 'C', label: '10'}], correct: 'B' },
      { id: 7, text: "Next: 🍎, 🍌, 🍎, 🍌, ?", options: [{id: 'A', label: '🍎'}, {id: 'B', label: '🍌'}, {id: 'C', label: '🍇'}], correct: 'A' },
      { id: 8, text: "Pattern: 5, 4, 3, 2, ?", options: [{id: 'A', label: '1'}, {id: 'B', label: '0'}, {id: 'C', label: '6'}], correct: 'A' },
      { id: 9, text: "What comes after? △, △, □, △, △, ?", options: [{id: 'A', label: '△'}, {id: 'B', label: '□'}, {id: 'C', label: '○'}], correct: 'B' },
      { id: 10, text: "Complete: 10, 20, 30, 40, ?", options: [{id: 'A', label: '45'}, {id: 'B', label: '50'}, {id: 'C', label: '60'}], correct: 'B' },
      { id: 11, text: "Next: 🐶, 🐱, 🐶, 🐱, ?", options: [{id: 'A', label: '🐶'}, {id: 'B', label: '🐱'}, {id: 'C', label: '🐭'}], correct: 'A' },
      { id: 12, text: "Pattern: 3, 6, 9, 12, ?", options: [{id: 'A', label: '14'}, {id: 'B', label: '15'}, {id: 'C', label: '18'}], correct: 'B' },
      { id: 13, text: "What follows? ☀️, ☁️, ☀️, ☁️, ?", options: [{id: 'A', label: '☀️'}, {id: 'B', label: '☁️'}, {id: 'C', label: '🌧️'}], correct: 'A' },
      { id: 14, text: "Complete: 7, 5, 3, 1, ?", options: [{id: 'A', label: '0'}, {id: 'B', label: '-1'}, {id: 'C', label: '2'}], correct: 'B' },
      { id: 15, text: "Next: 🟥, 🟥, 🟩, 🟥, 🟥, ?", options: [{id: 'A', label: '🟥'}, {id: 'B', label: '🟩'}, {id: 'C', label: '🟦'}], correct: 'B' },
      { id: 16, text: "Pattern: 2, 5, 8, 11, ?", options: [{id: 'A', label: '13'}, {id: 'B', label: '14'}, {id: 'C', label: '15'}], correct: 'B' },
      { id: 17, text: "What comes after? 🚗, 🚲, 🚗, 🚲, ?", options: [{id: 'A', label: '🚗'}, {id: 'B', label: '🚲'}, {id: 'C', label: '🚂'}], correct: 'A' },
      { id: 18, text: "Complete: 1, 4, 7, 10, ?", options: [{id: 'A', label: '12'}, {id: 'B', label: '13'}, {id: 'C', label: '14'}], correct: 'B' },
      { id: 19, text: "Next: 🦋, 🐝, 🦋, 🐝, ?", options: [{id: 'A', label: '🦋'}, {id: 'B', label: '🐝'}, {id: 'C', label: '🐞'}], correct: 'A' },
      { id: 20, text: "Pattern: 6, 8, 10, 12, ?", options: [{id: 'A', label: '13'}, {id: 'B', label: '14'}, {id: 'C', label: '16'}], correct: 'B' },
    ]
  },
  {
    name: "Level 2",
    questions: [
      { id: 21, text: "What comes next? AB, BC, CD, DE, ?", options: [{id: 'A', label: 'EF'}, {id: 'B', label: 'FG'}, {id: 'C', label: 'GH'}], correct: 'A' },
      { id: 22, text: "Complete: 2, 4, 8, 16, ?", options: [{id: 'A', label: '24'}, {id: 'B', label: '32'}, {id: 'C', label: '64'}], correct: 'B' },
      { id: 23, text: "Next: 🟢, 🟡, 🔴, 🟢, 🟡, ?", options: [{id: 'A', label: '🟢'}, {id: 'B', label: '🟡'}, {id: 'C', label: '🔴'}], correct: 'C' },
      { id: 24, text: "Pattern: 21, 18, 15, 12, ?", options: [{id: 'A', label: '9'}, {id: 'B', label: '10'}, {id: 'C', label: '8'}], correct: 'A' },
      { id: 25, text: "What follows? 🐭, 🐹, 🐰, 🐭, 🐹, ?", options: [{id: 'A', label: '🐭'}, {id: 'B', label: '🐹'}, {id: 'C', label: '🐰'}], correct: 'C' },
      { id: 26, text: "Complete: 1, 4, 9, 16, ?", options: [{id: 'A', label: '20'}, {id: 'B', label: '24'}, {id: 'C', label: '25'}], correct: 'C' },
      { id: 27, text: "Next: ✏️, 📏, ✏️, 📏, ?", options: [{id: 'A', label: '✏️'}, {id: 'B', label: '📏'}, {id: 'C', label: '📘'}], correct: 'A' },
      { id: 28, text: "Pattern: 30, 25, 20, 15, ?", options: [{id: 'A', label: '10'}, {id: 'B', label: '12'}, {id: 'C', label: '5'}], correct: 'A' },
      { id: 29, text: "What comes after? 🍕, 🍔, 🍟, 🍕, 🍔, ?", options: [{id: 'A', label: '🍕'}, {id: 'B', label: '🍔'}, {id: 'C', label: '🍟'}], correct: 'C' },
      { id: 30, text: "Complete: 2, 5, 8, 11, ?", options: [{id: 'A', label: '13'}, {id: 'B', label: '14'}, {id: 'C', label: '15'}], correct: 'B' },
      { id: 31, text: "Next: 🏀, ⚽, 🏀, ⚽, ?", options: [{id: 'A', label: '🏀'}, {id: 'B', label: '⚽'}, {id: 'C', label: '🏐'}], correct: 'A' },
      { id: 32, text: "Pattern: 100, 90, 80, 70, ?", options: [{id: 'A', label: '60'}, {id: 'B', label: '65'}, {id: 'C', label: '50'}], correct: 'A' },
      { id: 33, text: "What follows? 🎵, 🎶, 🎵, 🎶, ?", options: [{id: 'A', label: '🎵'}, {id: 'B', label: '🎶'}, {id: 'C', label: '🎷'}], correct: 'A' },
      { id: 34, text: "Complete: 3, 7, 11, 15, ?", options: [{id: 'A', label: '18'}, {id: 'B', label: '19'}, {id: 'C', label: '20'}], correct: 'B' },
      { id: 35, text: "Next: 🌸, 🌼, 🌻, 🌸, 🌼, ?", options: [{id: 'A', label: '🌸'}, {id: 'B', label: '🌼'}, {id: 'C', label: '🌻'}], correct: 'C' },
      { id: 36, text: "Pattern: 64, 56, 48, 40, ?", options: [{id: 'A', label: '32'}, {id: 'B', label: '36'}, {id: 'C', label: '30'}], correct: 'A' },
      { id: 37, text: "What comes after? 🐧, 🐦, 🐤, 🐧, 🐦, ?", options: [{id: 'A', label: '🐧'}, {id: 'B', label: '🐦'}, {id: 'C', label: '🐤'}], correct: 'C' },
      { id: 38, text: "Complete: 11, 22, 33, 44, ?", options: [{id: 'A', label: '55'}, {id: 'B', label: '66'}, {id: 'C', label: '77'}], correct: 'A' },
      { id: 39, text: "Next: 🟣, 🟠, 🟤, 🟣, 🟠, ?", options: [{id: 'A', label: '🟣'}, {id: 'B', label: '🟠'}, {id: 'C', label: '🟤'}], correct: 'C' },
      { id: 40, text: "Pattern: 1, 2, 4, 7, 11, ?", options: [{id: 'A', label: '15'}, {id: 'B', label: '16'}, {id: 'C', label: '17'}], correct: 'B' },
    ]
  },
  {
    name: "Level 3",
    questions: [
      { id: 41, text: "What comes next? AB, BC, CD, DE, EF, ?", options: [{id: 'A', label: 'FG'}, {id: 'B', label: 'GH'}, {id: 'C', label: 'HI'}], correct: 'A' },
      { id: 42, text: "Complete: 2, 4, 8, 14, 22, ?", options: [{id: 'A', label: '30'}, {id: 'B', label: '32'}, {id: 'C', label: '34'}], correct: 'B' },
      { id: 43, text: "Next: ●○, ●○, ○●, ●○, ●○, ?", options: [{id: 'A', label: '●○'}, {id: 'B', label: '○●'}, {id: 'C', label: '●●'}], correct: 'B' },
      { id: 44, text: "Pattern: 3, 6, 12, 24, ?", options: [{id: 'A', label: '36'}, {id: 'B', label: '48'}, {id: 'C', label: '96'}], correct: 'B' },
      { id: 45, text: "What follows? 🟥🟩, 🟩🟦, 🟦🟥, 🟥🟩, ?", options: [{id: 'A', label: '🟩🟦'}, {id: 'B', label: '🟦🟥'}, {id: 'C', label: '🟥🟩'}], correct: 'A' },
      { id: 46, text: "Complete: 1, 3, 9, 27, ?", options: [{id: 'A', label: '54'}, {id: 'B', label: '81'}, {id: 'C', label: '108'}], correct: 'B' },
      { id: 47, text: "Next: △□, □△, △□, □△, ?", options: [{id: 'A', label: '△□'}, {id: 'B', label: '□△'}, {id: 'C', label: '△△'}], correct: 'A' },
      { id: 48, text: "Pattern: 5, 9, 17, 33, ?", options: [{id: 'A', label: '65'}, {id: 'B', label: '63'}, {id: 'C', label: '67'}], correct: 'A' },
      { id: 49, text: "What comes after? 11, 22, 33, 44, ?", options: [{id: 'A', label: '55'}, {id: 'B', label: '66'}, {id: 'C', label: '77'}], correct: 'A' },
      { id: 50, text: "Complete: 2, 3, 5, 8, 13, ?", options: [{id: 'A', label: '20'}, {id: 'B', label: '21'}, {id: 'C', label: '34'}], correct: 'B' },
      { id: 51, text: "Next: 🍏🍎, 🍎🍐, 🍐🍊, 🍊🍋, ?", options: [{id: 'A', label: '🍋🍌'}, {id: 'B', label: '🍌🍇'}, {id: 'C', label: '🍇🍈'}], correct: 'A' },
      { id: 52, text: "Pattern: 7, 14, 28, 56, ?", options: [{id: 'A', label: '84'}, {id: 'B', label: '112'}, {id: 'C', label: '128'}], correct: 'B' },
      { id: 53, text: "What follows? 1, 4, 9, 16, 25, ?", options: [{id: 'A', label: '30'}, {id: 'B', label: '36'}, {id: 'C', label: '49'}], correct: 'B' },
      { id: 54, text: "Complete: 4, 12, 36, 108, ?", options: [{id: 'A', label: '216'}, {id: 'B', label: '324'}, {id: 'C', label: '432'}], correct: 'B' },
      { id: 55, text: "Next: 🐶🐱, 🐱🐭, 🐭🐹, 🐹🐰, ?", options: [{id: 'A', label: '🐰🦊'}, {id: 'B', label: '🦊🐻'}, {id: 'C', label: '🐻🐼'}], correct: 'A' },
      { id: 56, text: "Pattern: 6, 11, 21, 41, ?", options: [{id: 'A', label: '81'}, {id: 'B', label: '82'}, {id: 'C', label: '83'}], correct: 'A' },
      { id: 57, text: "What comes after? ▲, ▼, ▲, ▼, ?", options: [{id: 'A', label: '▲'}, {id: 'B', label: '▼'}, {id: 'C', label: '◀'}], correct: 'A' },
      { id: 58, text: "Complete: 2, 6, 18, 54, ?", options: [{id: 'A', label: '108'}, {id: 'B', label: '162'}, {id: 'C', label: '216'}], correct: 'B' },
      { id: 59, text: "Next: 🟠🟡, 🟡🟢, 🟢🔵, 🔵🟣, ?", options: [{id: 'A', label: '🟣🟠'}, {id: 'B', label: '🟠🟤'}, {id: 'C', label: '🟤⚫'}], correct: 'A' },
      { id: 60, text: "Pattern: 1, 3, 6, 10, 15, ?", options: [{id: 'A', label: '20'}, {id: 'B', label: '21'}, {id: 'C', label: '22'}], correct: 'B' },
    ]
  },
  {
    name: "Level 4",
    questions: [
      { id: 61, text: "What comes next? AB, CD, EF, GH, ?", options: [{id: 'A', label: 'IJ'}, {id: 'B', label: 'JK'}, {id: 'C', label: 'KL'}], correct: 'A' },
      { id: 62, text: "Complete: 1, 5, 13, 29, 61, ?", options: [{id: 'A', label: '125'}, {id: 'B', label: '123'}, {id: 'C', label: '127'}], correct: 'A' },
      { id: 63, text: "Next: 2, 3, 5, 7, 11, ?", options: [{id: 'A', label: '13'}, {id: 'B', label: '15'}, {id: 'C', label: '17'}], correct: 'A' },
      { id: 64, text: "Pattern: 4, 9, 19, 39, 79, ?", options: [{id: 'A', label: '159'}, {id: 'B', label: '149'}, {id: 'C', label: '169'}], correct: 'A' },
      { id: 65, text: "What follows? ◐, ◑, ◒, ◓, ?", options: [{id: 'A', label: '◐'}, {id: 'B', label: '◑'}, {id: 'C', label: '◓'}], correct: 'A' },
      { id: 66, text: "Complete: 8, 27, 64, 125, ?", options: [{id: 'A', label: '216'}, {id: 'B', label: '256'}, {id: 'C', label: '343'}], correct: 'A' },
      { id: 67, text: "Next: 🟥🟧, 🟧🟨, 🟨🟩, 🟩🟦, ?", options: [{id: 'A', label: '🟦🟪'}, {id: 'B', label: '🟪🟫'}, {id: 'C', label: '🟫⬛'}], correct: 'A' },
      { id: 68, text: "Pattern: 12, 21, 30, 39, 48, ?", options: [{id: 'A', label: '57'}, {id: 'B', label: '56'}, {id: 'C', label: '58'}], correct: 'A' },
      { id: 69, text: "What comes after? 1, 1, 2, 3, 5, 8, ?", options: [{id: 'A', label: '12'}, {id: 'B', label: '13'}, {id: 'C', label: '21'}], correct: 'B' },
      { id: 70, text: "Complete: 3, 8, 23, 68, 203, ?", options: [{id: 'A', label: '608'}, {id: 'B', label: '609'}, {id: 'C', label: '610'}], correct: 'A' },
      { id: 71, text: "Next: △▽, ▽△, △▽, ▽△, ?", options: [{id: 'A', label: '△▽'}, {id: 'B', label: '▽△'}, {id: 'C', label: '△△'}], correct: 'A' },
      { id: 72, text: "Pattern: 5, 14, 41, 122, ?", options: [{id: 'A', label: '365'}, {id: 'B', label: '366'}, {id: 'C', label: '367'}], correct: 'A' },
      { id: 73, text: "What follows? 🐋🐬, 🐬🐟, 🐟🐠, 🐠🐡, ?", options: [{id: 'A', label: '🐡🐙'}, {id: 'B', label: '🐙🦑'}, {id: 'C', label: '🦑🐋'}], correct: 'A' },
      { id: 74, text: "Complete: 2, 5, 10, 17, 26, ?", options: [{id: 'A', label: '35'}, {id: 'B', label: '36'}, {id: 'C', label: '37'}], correct: 'C' },
      { id: 75, text: "Next: 0, 1, 3, 6, 10, 15, ?", options: [{id: 'A', label: '20'}, {id: 'B', label: '21'}, {id: 'C', label: '22'}], correct: 'B' },
      { id: 76, text: "Pattern: 7, 26, 63, 124, 215, ?", options: [{id: 'A', label: '342'}, {id: 'B', label: '343'}, {id: 'C', label: '344'}], correct: 'A' },
      { id: 77, text: "What comes after? 🟩🟨, 🟨🟥, 🟥🟪, 🟪🟦, ?", options: [{id: 'A', label: '🟦🟩'}, {id: 'B', label: '🟩🟫'}, {id: 'C', label: '🟫⬛'}], correct: 'A' },
      { id: 78, text: "Complete: 1, 8, 27, 64, 125, ?", options: [{id: 'A', label: '216'}, {id: 'B', label: '256'}, {id: 'C', label: '343'}], correct: 'A' },
      { id: 79, text: "Next: 11, 13, 17, 19, 23, ?", options: [{id: 'A', label: '25'}, {id: 'B', label: '27'}, {id: 'C', label: '29'}], correct: 'C' },
      { id: 80, text: "Pattern: 4, 6, 12, 18, 30, 42, ?", options: [{id: 'A', label: '54'}, {id: 'B', label: '56'}, {id: 'C', label: '60'}], correct: 'C' },
    ]
  },
  {
    name: "Level 5",
    questions: [
      { id: 81, text: "What comes next? ABC, BCD, CDE, DEF, ?", options: [{id: 'A', label: 'EFG'}, {id: 'B', label: 'FGH'}, {id: 'C', label: 'GHI'}], correct: 'A' },
      { id: 82, text: "Complete: 2, 6, 30, 260, ?", options: [{id: 'A', label: '3130'}, {id: 'B', label: '3120'}, {id: 'C', label: '3132'}], correct: 'A' },
      { id: 83, text: "Next: 1, 2, 6, 24, 120, ?", options: [{id: 'A', label: '240'}, {id: 'B', label: '360'}, {id: 'C', label: '720'}], correct: 'C' },
      { id: 84, text: "Pattern: 8, 24, 48, 80, 120, ?", options: [{id: 'A', label: '168'}, {id: 'B', label: '160'}, {id: 'C', label: '180'}], correct: 'A' },
      { id: 85, text: "What follows? ◇◆, ◆◇, ◇◆, ◆◇, ?", options: [{id: 'A', label: '◇◆'}, {id: 'B', label: '◆◇'}, {id: 'C', label: '◇◇'}], correct: 'A' },
      { id: 86, text: "Complete: 2, 3, 7, 43, ?", options: [{id: 'A', label: '1807'}, {id: 'B', label: '1806'}, {id: 'C', label: '1808'}], correct: 'A' },
      { id: 87, text: "Next: 🟦🟪, 🟪🟥, 🟥🟧, 🟧🟨, ?", options: [{id: 'A', label: '🟨🟩'}, {id: 'B', label: '🟩🟦'}, {id: 'C', label: '🟦🟪'}], correct: 'A' },
      { id: 88, text: "Pattern: 5, 13, 25, 41, 61, ?", options: [{id: 'A', label: '85'}, {id: 'B', label: '84'}, {id: 'C', label: '86'}], correct: 'A' },
      { id: 89, text: "What comes after? 1, 3, 7, 15, 31, ?", options: [{id: 'A', label: '63'}, {id: 'B', label: '62'}, {id: 'C', label: '64'}], correct: 'A' },
      { id: 90, text: "Complete: 4, 18, 48, 100, 180, ?", options: [{id: 'A', label: '294'}, {id: 'B', label: '288'}, {id: 'C', label: '300'}], correct: 'A' },
      { id: 91, text: "Next: AB, BC, CD, DE, EF, ?", options: [{id: 'A', label: 'FG'}, {id: 'B', label: 'GH'}, {id: 'C', label: 'HI'}], correct: 'A' },
      { id: 92, text: "Pattern: 6, 30, 150, 750, ?", options: [{id: 'A', label: '3750'}, {id: 'B', label: '3000'}, {id: 'C', label: '3500'}], correct: 'A' },
      { id: 93, text: "What follows? 🐘🐫, 🐫🦒, 🦒🦏, 🦏🦛, ?", options: [{id: 'A', label: '🦛🐘'}, {id: 'B', label: '🐘🐘'}, {id: 'C', label: '🦛🦛'}], correct: 'A' },
      { id: 94, text: "Complete: 2, 12, 36, 80, 150, ?", options: [{id: 'A', label: '252'}, {id: 'B', label: '250'}, {id: 'C', label: '256'}], correct: 'A' },
      { id: 95, text: "Next: 1, 4, 27, 256, ?", options: [{id: 'A', label: '3125'}, {id: 'B', label: '1024'}, {id: 'C', label: '4096'}], correct: 'A' },
      { id: 96, text: "Pattern: 9, 20, 42, 86, 174, ?", options: [{id: 'A', label: '350'}, {id: 'B', label: '348'}, {id: 'C', label: '352'}], correct: 'A' },
      { id: 97, text: "What comes after? 🟥🟨, 🟨🟩, 🟩🟦, 🟦🟪, 🟪🟥, ?", options: [{id: 'A', label: '🟥🟨'}, {id: 'B', label: '🟨🟩'}, {id: 'C', label: '🟩🟦'}], correct: 'A' },
      { id: 98, text: "Complete: 3, 5, 11, 29, 83, ?", options: [{id: 'A', label: '245'}, {id: 'B', label: '243'}, {id: 'C', label: '247'}], correct: 'A' },
      { id: 99, text: "Next: 7, 26, 63, 124, 215, ?", options: [{id: 'A', label: '342'}, {id: 'B', label: '343'}, {id: 'C', label: '344'}], correct: 'A' },
      { id: 100, text: "Pattern: 1, 2, 5, 14, 41, 122, ?", options: [{id: 'A', label: '365'}, {id: 'B', label: '364'}, {id: 'C', label: '366'}], correct: 'A' },
    ]
  },
  {
    name: "Level 6",
    questions: [
      { id: 101, text: "What comes next? A, C, F, J, O, ?", options: [{id: 'A', label: 'T'}, {id: 'B', label: 'U'}, {id: 'C', label: 'V'}], correct: 'A' },
      { id: 102, text: "Complete: 2, 5, 14, 41, 122, 365, ?", options: [{id: 'A', label: '1094'}, {id: 'B', label: '1095'}, {id: 'C', label: '1096'}], correct: 'A' },
      { id: 103, text: "Next: 1, 2, 5, 26, 677, ?", options: [{id: 'A', label: '458330'}, {id: 'B', label: '458329'}, {id: 'C', label: '458331'}], correct: 'A' },
      { id: 104, text: "Pattern: 10, 21, 43, 87, 175, ?", options: [{id: 'A', label: '351'}, {id: 'B', label: '350'}, {id: 'C', label: '352'}], correct: 'A' },
      { id: 105, text: "What follows? ◆⬟, ⬟⬢, ⬢⬣, ⬣◆, ?", options: [{id: 'A', label: '◆⬟'}, {id: 'B', label: '⬟⬢'}, {id: 'C', label: '⬢⬣'}], correct: 'A' },
      { id: 106, text: "Complete: 1, 4, 15, 64, 325, ?", options: [{id: 'A', label: '1956'}, {id: 'B', label: '1955'}, {id: 'C', label: '1957'}], correct: 'A' },
      { id: 107, text: "Next: 🟪🟫, 🟫⬛, ⬛⬜, ⬜🟪, ?", options: [{id: 'A', label: '🟪🟫'}, {id: 'B', label: '🟫⬛'}, {id: 'C', label: '⬛⬜'}], correct: 'A' },
      { id: 108, text: "Pattern: 3, 9, 27, 81, 243, ?", options: [{id: 'A', label: '729'}, {id: 'B', label: '656'}, {id: 'C', label: '972'}], correct: 'A' },
      { id: 109, text: "What comes after? 0, 1, 2, 9, 730, ?", options: [{id: 'A', label: '389017001'}, {id: 'B', label: '389017000'}, {id: 'C', label: '389017002'}], correct: 'A' },
      { id: 110, text: "Complete: 2, 3, 8, 63, 3968, ?", options: [{id: 'A', label: '15745023'}, {id: 'B', label: '15745024'}, {id: 'C', label: '15745025'}], correct: 'A' },
      { id: 111, text: "Next: 🐉🐲, 🐲🐍, 🐍🐊, 🐊🐢, ?", options: [{id: 'A', label: '🐢🐉'}, {id: 'B', label: '🐉🐉'}, {id: 'C', label: '🐢🐢'}], correct: 'A' },
      { id: 112, text: "Pattern: 11, 31, 71, 151, 311, ?", options: [{id: 'A', label: '631'}, {id: 'B', label: '632'}, {id: 'C', label: '630'}], correct: 'A' },
      { id: 113, text: "What follows? 1, 1, 2, 4, 8, 32, 256, ?", options: [{id: 'A', label: '8192'}, {id: 'B', label: '4096'}, {id: 'C', label: '16384'}], correct: 'A' },
      { id: 114, text: "Complete: 6, 28, 496, 8128, ?", options: [{id: 'A', label: '33550336'}, {id: 'B', label: '33550335'}, {id: 'C', label: '33550337'}], correct: 'A' },
      { id: 115, text: "Next: 🟨🟧, 🟧🟥, 🟥🟪, 🟪🟦, 🟦🟩, ?", options: [{id: 'A', label: '🟩🟨'}, {id: 'B', label: '🟨🟩'}, {id: 'C', label: '🟩🟦'}], correct: 'A' },
      { id: 116, text: "Pattern: 5, 11, 23, 47, 95, 191, ?", options: [{id: 'A', label: '383'}, {id: 'B', label: '382'}, {id: 'C', label: '384'}], correct: 'A' },
      { id: 117, text: "What comes after? 13, 17, 19, 23, 29, 31, ?", options: [{id: 'A', label: '37'}, {id: 'B', label: '35'}, {id: 'C', label: '41'}], correct: 'A' },
      { id: 118, text: "Complete: 2, 2, 4, 12, 48, 240, ?", options: [{id: 'A', label: '1440'}, {id: 'B', label: '1200'}, {id: 'C', label: '1680'}], correct: 'A' },
      { id: 119, text: "Next: ⬤◯, ◯⬤, ⬤◯, ◯⬤, ?", options: [{id: 'A', label: '⬤◯'}, {id: 'B', label: '◯⬤'}, {id: 'C', label: '⬤⬤'}], correct: 'A' },
      { id: 120, text: "Pattern: 1, 3, 6, 10, 15, 21, 28, 36, ?", options: [{id: 'A', label: '45'}, {id: 'B', label: '44'}, {id: 'C', label: '46'}], correct: 'A' },
    ]
  }
];
// ==================== AUDIO MANAGER ====================
const AudioManager = {
  sounds: {} as Record<string, any>,

  async loadSounds() {
    if (Platform.OS === 'web') return;
    const soundFiles = {
      success: require('../../assets/sounds/success.mp3'),
      error: require('../../assets/sounds/error.mp3'),
      click: require('../../assets/sounds/click.mp3'),
      levelUp: require('../../assets/sounds/levelup.mp3'),
      gameComplete: require('../../assets/sounds/complete.mp3'),
    };
    for (const [key, source] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source);
        this.sounds[key] = sound;
      } catch (e) {}
    }
  },

  async playSound(key: string) {
    if (Platform.OS === 'web' || !this.sounds[key]) return;
    try {
      await this.sounds[key].replayAsync();
    } catch (error) {}
  },
};

// ==================== HAPTIC MANAGER ====================
const HapticManager = {
  light: () => Platform.OS === 'ios' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) : Vibration.vibrate(10),
  medium: () => Platform.OS === 'ios' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) : Vibration.vibrate(20),
  success: () => Platform.OS === 'ios' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Vibration.vibrate([0, 50, 50, 50]),
  error: () => Platform.OS === 'ios' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) : Vibration.vibrate([0, 100, 50, 100]),
};

// ==================== MAIN COMPONENT ====================
function PatternPathScreenContent({ navigation }: any) {
  const [gameState, setGameState] = useState<'loading' | 'levelSelect' | 'playing' | 'levelComplete' | 'gameComplete'>('loading');
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);               // marks for current level
  const [totalScoreAccumulated, setTotalScoreAccumulated] = useState(0); // across all levels
  const [attempts, setAttempts] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  const currentLevel = LEVELS[levelIndex];
  const currentQuestion = currentLevel?.questions[questionIndex];
  const totalQuestions = currentLevel?.questions.length || 0;

  // Load sounds
  useEffect(() => {
    AudioManager.loadSounds();
    loadHighScore();
    setTimeout(() => setGameState('levelSelect'), 1500);
  }, []);

  const loadHighScore = async () => {
    // You can implement AsyncStorage here if needed
  };

  // Reset options when question changes
  useEffect(() => {
    if (currentQuestion) {
      setCurrentOptions(shuffleArray(currentQuestion.options));
      setAttempts(0);
      setSelectedOptionId(null);
      setQuestionResolved(false);
    }
  }, [currentQuestion]);

  const shuffleArray = (array: any[]) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedback({ text, type });
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: -0.1, duration: 100, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const advanceToNextQuestion = () => {
    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex(prev => prev + 1);
    } else {
      // Level complete
      const newTotal = totalScoreAccumulated + score;
      setTotalScoreAccumulated(newTotal);
      if (levelIndex + 1 < LEVELS.length) {
        setGameState('levelComplete');
        if (!isMuted) AudioManager.playSound('levelUp');
        if (confettiRef.current) confettiRef.current.play();
      } else {
        setGameState('gameComplete');
        if (!isMuted) AudioManager.playSound('gameComplete');
        if (confettiRef.current) confettiRef.current.play();
      }
    }
  };

  // Generate a new extra option for wrong attempts (only for shape options)
  const generateExtraOption = (currentOpts: any[], correctAns: string | number) => {
    const usedIds = currentOpts.map(opt => (typeof opt === 'number' ? opt : null)).filter(id => id !== null);
    const possibleIds = SHAPES.map(s => s.id).filter(id => id !== correctAns && !usedIds.includes(id));
    if (possibleIds.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * possibleIds.length);
    return possibleIds[randomIndex];
  };

  const updateOptionsAfterWrong = () => {
    if (!currentQuestion) return;
    const baseOpts = currentQuestion.options;
    const allNumbers = baseOpts.every(opt => typeof opt === 'number');
    if (allNumbers) {
      const newExtra = generateExtraOption(currentOptions, currentQuestion.correct);
      if (newExtra) {
        const newOpts = [...currentOptions, newExtra];
        setCurrentOptions(shuffleArray(newOpts));
      } else {
        setCurrentOptions(shuffleArray(currentOptions));
      }
    } else {
      setCurrentOptions(shuffleArray(currentOptions));
    }
  };

  const handleOptionSelect = (optionId: string | number) => {
    if (gameState !== 'playing' || questionResolved) return;

    setSelectedOptionId(optionId);
    animatePress();
    HapticManager.light();
    if (!isMuted) AudioManager.playSound('click');

    const isCorrect = optionId === currentQuestion.correct;

    if (isCorrect) {
      setScore(prev => prev + 2);
      showFeedback('+2! Great job!', 'success');
      HapticManager.success();
      if (!isMuted) AudioManager.playSound('success');
      if (confettiRef.current) confettiRef.current.play();
      setQuestionResolved(true);
      setTimeout(() => advanceToNextQuestion(), 1000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      showFeedback('Try again!', 'error');
      HapticManager.error();
      if (!isMuted) AudioManager.playSound('error');
      animateShake();

      if (newAttempts >= 3) {
        setScore(prev => prev - 2);
        showFeedback('-2 marks', 'error');
        setQuestionResolved(true);
        setTimeout(() => advanceToNextQuestion(), 1000);
      } else {
        updateOptionsAfterWrong();
      }
    }
  };

  const handleLevelSelect = (index: number) => {
    setLevelIndex(index);
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState('playing');
    HapticManager.success();
  };

  const handleNextLevel = () => {
    if (levelIndex + 1 < LEVELS.length) {
      setLevelIndex(prev => prev + 1);
      setQuestionIndex(0);
      setScore(0);
      setAttempts(0);
      setQuestionResolved(false);
      setSelectedOptionId(null);
      setGameState('playing');
      setCompletionVisible(false);
    }
  };

  const handlePlayAgain = () => {
    setLevelIndex(0);
    setQuestionIndex(0);
    setScore(0);
    setTotalScoreAccumulated(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState('playing');
  };

  const handleGoHome = () => setGameState('levelSelect');

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.1, 0, 0.1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  // ==================== RENDER STATES ====================
  if (gameState === 'loading') {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={[styles.loadingEmoji, { fontSize: 80 }]}>🔴🟦🔺</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: 24 }]}>Loading Pattern Path...</Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === 'levelSelect') {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={[styles.welcomeTitle, { fontSize: 32 }]}>🧩 Pattern Path</Text>
        <Text style={[styles.welcomeSubtitle, { fontSize: 18 }]}>Choose a level!</Text>
        <ScrollView contentContainerStyle={styles.levelContainer} showsVerticalScrollIndicator={false}>
          {LEVELS.map((level, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.levelButton}
              onPress={() => handleLevelSelect(idx)}
            >
              <Text style={[styles.levelButtonText, { fontSize: 22 }]}>{level.name}</Text>
              <Text style={[styles.levelQuestions, { fontSize: 14 }]}>{level.questions.length} questions</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => setSettingsVisible(true)}>
          <Text style={[styles.settingsText, { fontSize: 28 }]}>⚙️</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (gameState === 'levelComplete') {
    const isPerfect = score === totalQuestions * 2;
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
        <Text style={[styles.completeTitle, { fontSize: 32 }]}>🎉 Level Complete! 🎉</Text>
        <Text style={[styles.completeSubtitle, { fontSize: 18 }]}>{currentLevel.name}</Text>
        <View style={[styles.resultCard, { padding: 20 }]}>
          <Text style={[styles.resultScore, { fontSize: 28 }]}>Your score: {score} / {totalQuestions * 2}</Text>
          {isPerfect && <Text style={[styles.newRecord, { fontSize: 18 }]}>🌟 Perfect! 🌟</Text>}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.homeButton]} onPress={() => setGameState('levelSelect')}>
            <Text style={styles.actionButtonText}>Levels</Text>
          </TouchableOpacity>
          {levelIndex + 1 < LEVELS.length && (
            <TouchableOpacity style={[styles.actionButton, styles.nextLevelButton]} onPress={handleNextLevel}>
              <Text style={styles.actionButtonText}>Next Level →</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === 'gameComplete') {
    const totalPossible = LEVELS.reduce((acc, level) => acc + level.questions.length * 2, 0);
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
        <Text style={[styles.completeTitle, { fontSize: 36 }]}>🏆 Game Complete! 🏆</Text>
        <Text style={[styles.completeSubtitle, { fontSize: 18 }]}>You finished all levels!</Text>
        <View style={[styles.resultCard, { padding: 20 }]}>
          <Text style={[styles.resultScore, { fontSize: 28 }]}>Total: {totalScoreAccumulated} / {totalPossible}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.playAgainButton]} onPress={handlePlayAgain}>
            <Text style={styles.actionButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.homeButton]} onPress={() => setGameState('levelSelect')}>
            <Text style={styles.actionButtonText}>Levels</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==================== PLAYING STATE ====================
  if (!currentQuestion) return null;

  const renderOptions = () => {
    return currentOptions.map((opt, idx) => {
      const isShape = typeof opt === 'number';
      const optionId = isShape ? opt : opt.id;
      const shape = isShape ? SHAPES.find(s => s.id === opt) : null;
      const isSelected = selectedOptionId === optionId;

      return (
        <Animated.View
          key={idx}
          style={{
            transform: [
              { scale: isSelected ? scaleAnim : 1 },
              { rotate: rotateInterpolate },
            ],
          }}
        >
          <TouchableOpacity
            onPress={() => handleOptionSelect(optionId)}
            activeOpacity={0.7}
            disabled={questionResolved}
            style={[
              styles.optionTouch,
              isShape ? { width: 80, height: 80 } : { minWidth: 100, paddingHorizontal: 15, paddingVertical: 12 },
              isSelected && styles.optionSelected,
              questionResolved && styles.optionDisabled,
            ]}
          >
            {isShape ? (
              <View
                style={[
                  styles.shapeCircle,
                  {
                    backgroundColor: shape?.color,
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                  },
                ]}
              >
                <Text style={[styles.shapeEmoji, { fontSize: 40 }]}>{shape?.emoji}</Text>
              </View>
            ) : (
              <View style={styles.textOption}>
                <Text style={[styles.optionText, { fontSize: 20 }]}>{opt.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoHome} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.levelName}>{currentLevel.name}</Text>
          <Text style={styles.questionCounter}>Q{questionIndex+1}/{totalQuestions}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.muteButton}>
            <Text style={styles.muteText}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === questionIndex && styles.progressDotActive,
              i < questionIndex && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>Attempts: {attempts}/3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
        </View>

        <View style={styles.optionsGrid}>{renderOptions()}</View>
      </ScrollView>

      {feedback && (
        <Animated.View
          style={[
            styles.floatingMessage,
            feedback.type === 'success' ? styles.successMessage : styles.errorMessage,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.floatingText}>{feedback.text}</Text>
        </Animated.View>
      )}

      {/* Settings Modal */}
      <Modal visible={settingsVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => setIsMuted(!isMuted)}>
              <Text style={styles.modalOptionText}>Sound: {isMuted ? 'Off' : 'On'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.modalCloseButton]} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function PatternPathScreen(props: any) {
  return (
    <ErrorBoundary>
      <PatternPathScreenContent {...props} />
    </ErrorBoundary>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingEmoji: { marginBottom: 20 },
  loadingText: { fontWeight: '600', color: COLORS.text, marginBottom: 30 },
  progressBar: { width: '80%', height: 8, backgroundColor: COLORS.surface, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.secondary },
  welcomeTitle: { fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, textAlign: 'center' },
  welcomeSubtitle: { color: COLORS.textLight, marginBottom: 30 },
  levelContainer: { width: '90%', paddingVertical: 20, alignItems: 'center' },
  levelButton: {
    backgroundColor: COLORS.secondary,
    padding: 18,
    borderRadius: 40,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 5,
    width: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  levelButtonText: { color: COLORS.text, fontWeight: '600' },
  levelQuestions: { color: COLORS.textLight, marginTop: 4 },
  settingsIcon: { position: 'absolute', top: 20, right: 20, padding: 10 },
  settingsText: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
  },
  backButton: { padding: 10 },
  backText: { fontSize: 32, color: 'white' },
  headerCenter: { alignItems: 'center' },
  levelName: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  questionCounter: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  muteButton: { marginRight: 15 },
  muteText: { fontSize: 24 },
  scoreBadge: {
    backgroundColor: COLORS.success,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    flexWrap: 'wrap',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CCC',
    marginHorizontal: 5,
    marginVertical: 2,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressDotCompleted: { backgroundColor: COLORS.success },
  statsRow: { alignItems: 'center', marginVertical: 5 },
  statsText: { fontSize: 18, color: COLORS.textLight },
  mainContent: { flexGrow: 1, padding: 20, alignItems: 'center' },
  questionContainer: { marginBottom: 30, paddingHorizontal: 20 },
  questionText: { fontSize: 24, color: COLORS.text, textAlign: 'center', fontWeight: '500' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 10 },
  optionTouch: { justifyContent: 'center', alignItems: 'center', margin: 5 },
  optionSelected: {
    transform: [{ scale: 1.1 }],
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  optionDisabled: { opacity: 0.5 },
  shapeCircle: { justifyContent: 'center', alignItems: 'center', elevation: 3 },
  shapeEmoji: {},
  textOption: { backgroundColor: COLORS.surface, borderRadius: 25, paddingHorizontal: 18, paddingVertical: 12, elevation: 3 },
  optionText: { color: COLORS.text, fontWeight: '500' },
  floatingMessage: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  successMessage: { backgroundColor: COLORS.success },
  errorMessage: { backgroundColor: COLORS.error },
  floatingText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  confetti: { position: 'absolute', width: '100%', height: '100%' },
  completeTitle: { fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 8 },
  completeSubtitle: { color: COLORS.textLight, marginBottom: 30 },
  resultCard: { backgroundColor: COLORS.surface, borderRadius: 30, alignItems: 'center', marginBottom: 30, elevation: 5, width: '80%' },
  resultScore: { fontWeight: 'bold', color: COLORS.text },
  newRecord: { color: COLORS.gold, fontWeight: 'bold', marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  actionButton: { borderRadius: 50, paddingHorizontal: 20, paddingVertical: 15, minWidth: 120, alignItems: 'center', elevation: 3 },
  homeButton: { backgroundColor: COLORS.secondary },
  nextLevelButton: { backgroundColor: COLORS.accent },
  playAgainButton: { backgroundColor: COLORS.primary },
  actionButtonText: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 30, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  modalOption: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  modalOptionText: { fontSize: 18, color: COLORS.text },
  modalButton: { borderRadius: 25, paddingVertical: 12, paddingHorizontal: 30, marginTop: 10 },
  modalCloseButton: { backgroundColor: COLORS.secondary },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});