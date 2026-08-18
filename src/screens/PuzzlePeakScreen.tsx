import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  Platform,
  Modal,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

// ==================== CONSTANTS & CONFIG ====================
const COLORS = {
  primary: '#FF9A8B',
  secondary: '#99E2D0',
  accent: '#FFD966',
  purple: '#C5A3FF',
  pink: '#FFB3C6',
  teal: '#6DD3CE',
  background: '#FEF9E7',
  surface: '#FFFFFF',
  text: '#2D4059',
  textLight: '#5C6B7E',
  success: '#A3D9A5',
  error: '#F4A2A2',
  gold: '#F9D56E',
  shadow: '#000000',
};

// ==================== SHAPE DATA (unused but kept for compatibility) ====================
const SHAPES = [
  { id: 1, name: "Circle", color: '#FFB347', emoji: "🔴", description: "round like a ball" },
  { id: 2, name: "Square", color: '#6C9EBF', emoji: "🟦", description: "four equal sides" },
  { id: 3, name: "Triangle", color: '#F4A261', emoji: "🔺", description: "three sides" },
  { id: 4, name: "Star", color: '#E9B741', emoji: "⭐", description: "shining in the sky" },
  { id: 5, name: "Heart", color: '#E57373', emoji: "❤️", description: "love shape" },
  { id: 6, name: "Oval", color: '#81A4C6', emoji: "🥚", description: "egg-shaped" },
  { id: 7, name: "Rectangle", color: '#B5A886', emoji: "🟦", description: "four sides, two long" },
  { id: 8, name: "Pentagon", color: '#C4A77D', emoji: "⬟", description: "five sides" },
  { id: 9, name: "Hexagon", color: '#A3C4A2', emoji: "⬡", description: "six sides" },
  { id: 10, name: "Octagon", color: '#D4A5A5', emoji: "🛑", description: "eight sides" },
  { id: 11, name: "Rhombus", color: '#B2A4D4', emoji: "💠", description: "diamond shape" },
  { id: 12, name: "Trapezoid", color: '#A4C8D4', emoji: "📐", description: "four sides, two parallel" },
];

// ==================== LEVELS & QUESTIONS (120 brand new logic questions) ====================
const LEVELS = [
  {
    name: "Level 1",
    questions: [
      { id: 1, text: "What comes next? 2, 4, 6, ?", options: [{id:'A',label:'7'},{id:'B',label:'8'},{id:'C',label:'9'},{id:'D',label:'10'}], correct: 'B' },
      { id: 2, text: "Which one is different? Apple, Banana, Carrot, Grape", options: [{id:'A',label:'Apple'},{id:'B',label:'Banana'},{id:'C',label:'Carrot'},{id:'D',label:'Grape'}], correct: 'C' },
      { id: 3, text: "If you have 5 apples and you eat 2, how many left?", options: [{id:'A',label:'2'},{id:'B',label:'3'},{id:'C',label:'4'},{id:'D',label:'5'}], correct: 'B' },
      { id: 4, text: "Which number is missing? 1, 3, 5, ?, 9", options: [{id:'A',label:'6'},{id:'B',label:'7'},{id:'C',label:'8'},{id:'D',label:'10'}], correct: 'B' },
      { id: 5, text: "What is the opposite of hot?", options: [{id:'A',label:'warm'},{id:'B',label:'cold'},{id:'C',label:'cool'},{id:'D',label:'ice'}], correct: 'B' },
      { id: 6, text: "Which shape has three sides?", options: [{id:'A',label:'square'},{id:'B',label:'circle'},{id:'C',label:'triangle'},{id:'D',label:'rectangle'}], correct: 'C' },
      { id: 7, text: "How many legs does a dog have?", options: [{id:'A',label:'2'},{id:'B',label:'4'},{id:'C',label:'6'},{id:'D',label:'8'}], correct: 'B' },
      { id: 8, text: "Which word is a color?", options: [{id:'A',label:'run'},{id:'B',label:'red'},{id:'C',label:'read'},{id:'D',label:'rod'}], correct: 'B' },
      { id: 9, text: "What is 3 + 4?", options: [{id:'A',label:'6'},{id:'B',label:'7'},{id:'C',label:'8'},{id:'D',label:'9'}], correct: 'B' },
      { id: 10, text: "Which one is a fruit?", options: [{id:'A',label:'carrot'},{id:'B',label:'banana'},{id:'C',label:'potato'},{id:'D',label:'onion'}], correct: 'B' },
      { id: 11, text: "What comes after Monday?", options: [{id:'A',label:'Sunday'},{id:'B',label:'Tuesday'},{id:'C',label:'Wednesday'},{id:'D',label:'Friday'}], correct: 'B' },
      { id: 12, text: "Which is the smallest?", options: [{id:'A',label:'1'},{id:'B',label:'5'},{id:'C',label:'10'},{id:'D',label:'20'}], correct: 'A' },
      { id: 13, text: "Which one is round?", options: [{id:'A',label:'book'},{id:'B',label:'ball'},{id:'C',label:'box'},{id:'D',label:'brick'}], correct: 'B' },
      { id: 14, text: "How many days in a week?", options: [{id:'A',label:'5'},{id:'B',label:'6'},{id:'C',label:'7'},{id:'D',label:'8'}], correct: 'C' },
      { id: 15, text: "Which one can fly?", options: [{id:'A',label:'fish'},{id:'B',label:'bird'},{id:'C',label:'dog'},{id:'D',label:'cat'}], correct: 'B' },
      { id: 16, text: "What is 10 - 3?", options: [{id:'A',label:'6'},{id:'B',label:'7'},{id:'C',label:'8'},{id:'D',label:'9'}], correct: 'B' },
      { id: 17, text: "Which is a number?", options: [{id:'A',label:'tree'},{id:'B',label:'three'},{id:'C',label:'free'},{id:'D',label:'see'}], correct: 'B' },
      { id: 18, text: "Which one is a toy?", options: [{id:'A',label:'doll'},{id:'B',label:'cup'},{id:'C',label:'plate'},{id:'D',label:'spoon'}], correct: 'A' },
      { id: 19, text: "What is the first letter of 'cat'?", options: [{id:'A',label:'a'},{id:'B',label:'b'},{id:'C',label:'c'},{id:'D',label:'d'}], correct: 'C' },
      { id: 20, text: "Which one is a month?", options: [{id:'A',label:'May'},{id:'B',label:'Car'},{id:'C',label:'Dog'},{id:'D',label:'Book'}], correct: 'A' },
    ]
  },
  {
    name: "Level 2",
    questions: [
      { id: 21, text: "What comes next? 5, 10, 15, ?", options: [{id:'A',label:'18'},{id:'B',label:'20'},{id:'C',label:'25'},{id:'D',label:'30'}], correct: 'B' },
      { id: 22, text: "Which one is not a primary color?", options: [{id:'A',label:'red'},{id:'B',label:'blue'},{id:'C',label:'yellow'},{id:'D',label:'green'}], correct: 'D' },
      { id: 23, text: "If you have 3 pairs of shoes, how many shoes?", options: [{id:'A',label:'3'},{id:'B',label:'4'},{id:'C',label:'5'},{id:'D',label:'6'}], correct: 'D' },
      { id: 24, text: "Which word is a number?", options: [{id:'A',label:'ate'},{id:'B',label:'eight'},{id:'C',label:'height'},{id:'D',label:'weight'}], correct: 'B' },
      { id: 25, text: "Complete the pattern: ★, ★★, ★★★, ?", options: [{id:'A',label:'★'},{id:'B',label:'★★'},{id:'C',label:'★★★★'},{id:'D',label:'★★★★★'}], correct: 'C' },
      { id: 26, text: "Which animal says 'meow'?", options: [{id:'A',label:'dog'},{id:'B',label:'cat'},{id:'C',label:'cow'},{id:'D',label:'pig'}], correct: 'B' },
      { id: 27, text: "How many sides does a square have?", options: [{id:'A',label:'3'},{id:'B',label:'4'},{id:'C',label:'5'},{id:'D',label:'6'}], correct: 'B' },
      { id: 28, text: "Which one is a vehicle?", options: [{id:'A',label:'car'},{id:'B',label:'tree'},{id:'C',label:'house'},{id:'D',label:'ball'}], correct: 'A' },
      { id: 29, text: "What is 12 divided by 3?", options: [{id:'A',label:'3'},{id:'B',label:'4'},{id:'C',label:'5'},{id:'D',label:'6'}], correct: 'B' },
      { id: 30, text: "Which one is a season?", options: [{id:'A',label:'winter'},{id:'B',label:'water'},{id:'C',label:'wind'},{id:'D',label:'window'}], correct: 'A' },
      { id: 31, text: "Which letter comes after P?", options: [{id:'A',label:'O'},{id:'B',label:'Q'},{id:'C',label:'R'},{id:'D',label:'S'}], correct: 'B' },
      { id: 32, text: "Which one is a continent?", options: [{id:'A',label:'Asia'},{id:'B',label:'Atlantic'},{id:'C',label:'Arctic'},{id:'D',label:'Alps'}], correct: 'A' },
      { id: 33, text: "How many minutes in an hour?", options: [{id:'A',label:'30'},{id:'B',label:'60'},{id:'C',label:'90'},{id:'D',label:'120'}], correct: 'B' },
      { id: 34, text: "Which one is a tool?", options: [{id:'A',label:'hammer'},{id:'B',label:'milk'},{id:'C',label:'bread'},{id:'D',label:'chair'}], correct: 'A' },
      { id: 35, text: "What is the opposite of big?", options: [{id:'A',label:'tall'},{id:'B',label:'large'},{id:'C',label:'small'},{id:'D',label:'huge'}], correct: 'C' },
      { id: 36, text: "Which number is even?", options: [{id:'A',label:'3'},{id:'B',label:'5'},{id:'C',label:'7'},{id:'D',label:'8'}], correct: 'D' },
      { id: 37, text: "Which word means the same as 'happy'?", options: [{id:'A',label:'sad'},{id:'B',label:'glad'},{id:'C',label:'mad'},{id:'D',label:'bad'}], correct: 'B' },
      { id: 38, text: "Which one is a planet?", options: [{id:'A',label:'Mars'},{id:'B',label:'Moon'},{id:'C',label:'Sun'},{id:'D',label:'Star'}], correct: 'A' },
      { id: 39, text: "What is 9 + 6?", options: [{id:'A',label:'14'},{id:'B',label:'15'},{id:'C',label:'16'},{id:'D',label:'17'}], correct: 'B' },
      { id: 40, text: "Which one is a drink?", options: [{id:'A',label:'water'},{id:'B',label:'bread'},{id:'C',label:'rice'},{id:'D',label:'meat'}], correct: 'A' },
    ]
  },
  {
    name: "Level 3",
    questions: [
      { id: 41, text: "What is the next number? 2, 3, 5, 8, ?", options: [{id:'A',label:'11'},{id:'B',label:'12'},{id:'C',label:'13'},{id:'D',label:'14'}], correct: 'B' },
      { id: 42, text: "Which word does not belong? run, walk, jump, eat", options: [{id:'A',label:'run'},{id:'B',label:'walk'},{id:'C',label:'jump'},{id:'D',label:'eat'}], correct: 'D' },
      { id: 43, text: "If a shirt costs $20 and you have $15, how much more do you need?", options: [{id:'A',label:'5'},{id:'B',label:'10'},{id:'C',label:'15'},{id:'D',label:'20'}], correct: 'A' },
      { id: 44, text: "Which number is odd?", options: [{id:'A',label:'12'},{id:'B',label:'14'},{id:'C',label:'16'},{id:'D',label:'17'}], correct: 'D' },
      { id: 45, text: "Complete the analogy: Hand is to glove as foot is to ?", options: [{id:'A',label:'shoe'},{id:'B',label:'sock'},{id:'C',label:'pant'},{id:'D',label:'hat'}], correct: 'B' },
      { id: 46, text: "What is the capital of France?", options: [{id:'A',label:'London'},{id:'B',label:'Paris'},{id:'C',label:'Rome'},{id:'D',label:'Berlin'}], correct: 'B' },
      { id: 47, text: "How many hours in a day?", options: [{id:'A',label:'12'},{id:'B',label:'24'},{id:'C',label:'36'},{id:'D',label:'48'}], correct: 'B' },
      { id: 48, text: "Which one is a musical instrument?", options: [{id:'A',label:'piano'},{id:'B',label:'table'},{id:'C',label:'chair'},{id:'D',label:'bed'}], correct: 'A' },
      { id: 49, text: "What is 15 - 7?", options: [{id:'A',label:'7'},{id:'B',label:'8'},{id:'C',label:'9'},{id:'D',label:'10'}], correct: 'B' },
      { id: 50, text: "Which word is a verb?", options: [{id:'A',label:'run'},{id:'B',label:'red'},{id:'C',label:'road'},{id:'D',label:'roof'}], correct: 'A' },
      { id: 51, text: "Which shape has four equal sides?", options: [{id:'A',label:'rectangle'},{id:'B',label:'square'},{id:'C',label:'triangle'},{id:'D',label:'circle'}], correct: 'B' },
      { id: 52, text: "Which one is a mammal?", options: [{id:'A',label:'dolphin'},{id:'B',label:'fish'},{id:'C',label:'shark'},{id:'D',label:'crab'}], correct: 'A' },
      { id: 53, text: "What is 4 times 6?", options: [{id:'A',label:'20'},{id:'B',label:'24'},{id:'C',label:'28'},{id:'D',label:'30'}], correct: 'B' },
      { id: 54, text: "Which one is a metal?", options: [{id:'A',label:'iron'},{id:'B',label:'wood'},{id:'C',label:'plastic'},{id:'D',label:'paper'}], correct: 'A' },
      { id: 55, text: "Which word is a synonym for 'quick'?", options: [{id:'A',label:'slow'},{id:'B',label:'fast'},{id:'C',label:'last'},{id:'D',label:'past'}], correct: 'B' },
      { id: 56, text: "How many centimeters in a meter?", options: [{id:'A',label:'10'},{id:'B',label:'100'},{id:'C',label:'1000'},{id:'D',label:'10000'}], correct: 'B' },
      { id: 57, text: "Which one is a type of tree?", options: [{id:'A',label:'oak'},{id:'B',label:'oat'},{id:'C',label:'oar'},{id:'D',label:'oil'}], correct: 'A' },
      { id: 58, text: "What is the next letter? A, C, E, G, ?", options: [{id:'A',label:'H'},{id:'B',label:'I'},{id:'C',label:'J'},{id:'D',label:'K'}], correct: 'B' },
      { id: 59, text: "Which one is a unit of time?", options: [{id:'A',label:'second'},{id:'B',label:'meter'},{id:'C',label:'liter'},{id:'D',label:'gram'}], correct: 'A' },
      { id: 60, text: "If you have a dozen eggs, how many?", options: [{id:'A',label:'10'},{id:'B',label:'12'},{id:'C',label:'14'},{id:'D',label:'16'}], correct: 'B' },
    ]
  },
  {
    name: "Level 4 ",
    questions: [
      { id: 61, text: "What comes next? 3, 6, 11, 18, ?", options: [{id:'A',label:'25'},{id:'B',label:'26'},{id:'C',label:'27'},{id:'D',label:'28'}], correct: 'C' },
      { id: 62, text: "Which word is the odd one out? apple, banana, orange, carrot", options: [{id:'A',label:'apple'},{id:'B',label:'banana'},{id:'C',label:'orange'},{id:'D',label:'carrot'}], correct: 'D' },
      { id: 63, text: "If today is Monday, what day is 3 days later?", options: [{id:'A',label:'Tuesday'},{id:'B',label:'Wednesday'},{id:'C',label:'Thursday'},{id:'D',label:'Friday'}], correct: 'C' },
      { id: 64, text: "Which number is a prime?", options: [{id:'A',label:'9'},{id:'B',label:'15'},{id:'C',label:'17'},{id:'D',label:'21'}], correct: 'C' },
      { id: 65, text: "Complete the analogy: Bird is to sky as fish is to ?", options: [{id:'A',label:'sea'},{id:'B',label:'land'},{id:'C',label:'air'},{id:'D',label:'tree'}], correct: 'A' },
      { id: 66, text: "What is the square root of 81?", options: [{id:'A',label:'7'},{id:'B',label:'8'},{id:'C',label:'9'},{id:'D',label:'10'}], correct: 'C' },
      { id: 67, text: "Which one is a continent?", options: [{id:'A',label:'Africa'},{id:'B',label:'Europe'},{id:'C',label:'Atlantic'},{id:'D',label:'Pacific'}], correct: 'A' },
      { id: 68, text: "How many sides does a pentagon have?", options: [{id:'A',label:'4'},{id:'B',label:'5'},{id:'C',label:'6'},{id:'D',label:'7'}], correct: 'B' },
      { id: 69, text: "Which word means the opposite of 'light'?", options: [{id:'A',label:'dark'},{id:'B',label:'heavy'},{id:'C',label:'bright'},{id:'D',label:'shine'}], correct: 'A' },
      { id: 70, text: "What is 18 + 7?", options: [{id:'A',label:'24'},{id:'B',label:'25'},{id:'C',label:'26'},{id:'D',label:'27'}], correct: 'B' },
      { id: 71, text: "Which one is a programming language?", options: [{id:'A',label:'Python'},{id:'B',label:'Cobra'},{id:'C',label:'Viper'},{id:'D',label:'Anaconda'}], correct: 'A' },
      { id: 72, text: "How many degrees in a right angle?", options: [{id:'A',label:'45'},{id:'B',label:'90'},{id:'C',label:'180'},{id:'D',label:'360'}], correct: 'B' },
      { id: 73, text: "Which one is a gas?", options: [{id:'A',label:'oxygen'},{id:'B',label:'water'},{id:'C',label:'sand'},{id:'D',label:'rock'}], correct: 'A' },
      { id: 74, text: "What is the missing number? 2, 4, 8, 16, ?", options: [{id:'A',label:'24'},{id:'B',label:'32'},{id:'C',label:'64'},{id:'D',label:'128'}], correct: 'B' },
      { id: 75, text: "Which word is a profession?", options: [{id:'A',label:'teacher'},{id:'B',label:'student'},{id:'C',label:'school'},{id:'D',label:'book'}], correct: 'A' },
      { id: 76, text: "Which one is a country?", options: [{id:'A',label:'Canada'},{id:'B',label:'Chicago'},{id:'C',label:'California'},{id:'D',label:'Cairo'}], correct: 'A' },
      { id: 77, text: "What is 20% of 50?", options: [{id:'A',label:'5'},{id:'B',label:'10'},{id:'C',label:'15'},{id:'D',label:'20'}], correct: 'B' },
      { id: 78, text: "Which one is a type of bird?", options: [{id:'A',label:'eagle'},{id:'B',label:'lion'},{id:'C',label:'tiger'},{id:'D',label:'bear'}], correct: 'A' },
      { id: 79, text: "Which letter is a vowel?", options: [{id:'A',label:'B'},{id:'B',label:'C'},{id:'C',label:'D'},{id:'D',label:'E'}], correct: 'D' },
      { id: 80, text: "If you have 4 quarters, how many dollars?", options: [{id:'A',label:'0.5'},{id:'B',label:'1'},{id:'C',label:'2'},{id:'D',label:'4'}], correct: 'B' },
    ]
  },
  {
    name: "Level 5",
    questions: [
      { id: 81, text: "What is the next number? 1, 4, 9, 16, ?", options: [{id:'A',label:'20'},{id:'B',label:'25'},{id:'C',label:'30'},{id:'D',label:'36'}], correct: 'B' },
      { id: 82, text: "Which word does not belong? happy, joyful, sad, elated", options: [{id:'A',label:'happy'},{id:'B',label:'joyful'},{id:'C',label:'sad'},{id:'D',label:'elated'}], correct: 'C' },
      { id: 83, text: "If a train leaves at 3:15 and arrives at 5:45, how long is the journey?", options: [{id:'A',label:'2h'},{id:'B',label:'2h15m'},{id:'C',label:'2h30m'},{id:'D',label:'3h'}], correct: 'C' },
      { id: 84, text: "Which number is divisible by 3?", options: [{id:'A',label:'14'},{id:'B',label:'16'},{id:'C',label:'18'},{id:'D',label:'20'}], correct: 'C' },
      { id: 85, text: "Complete the analogy: Book is to read as food is to ?", options: [{id:'A',label:'cook'},{id:'B',label:'eat'},{id:'C',label:'buy'},{id:'D',label:'sell'}], correct: 'B' },
      { id: 86, text: "What is the value of π approximated?", options: [{id:'A',label:'2.14'},{id:'B',label:'3.14'},{id:'C',label:'4.14'},{id:'D',label:'5.14'}], correct: 'B' },
      { id: 87, text: "Which one is a noble gas?", options: [{id:'A',label:'Helium'},{id:'B',label:'Gold'},{id:'C',label:'Silver'},{id:'D',label:'Iron'}], correct: 'A' },
      { id: 88, text: "How many millimeters in a centimeter?", options: [{id:'A',label:'10'},{id:'B',label:'100'},{id:'C',label:'1000'},{id:'D',label:'0.1'}], correct: 'A' },
      { id: 89, text: "Which word is a synonym for 'difficult'?", options: [{id:'A',label:'easy'},{id:'B',label:'soft'},{id:'C',label:'hard'},{id:'D',label:'light'}], correct: 'C' },
      { id: 90, text: "What is 36 divided by 4?", options: [{id:'A',label:'8'},{id:'B',label:'9'},{id:'C',label:'10'},{id:'D',label:'11'}], correct: 'B' },
      { id: 91, text: "Which one is a continent?", options: [{id:'A',label:'Australia'},{id:'B',label:'Greenland'},{id:'C',label:'Iceland'},{id:'D',label:'New Zealand'}], correct: 'A' },
      { id: 92, text: "How many sides does a hexagon have?", options: [{id:'A',label:'5'},{id:'B',label:'6'},{id:'C',label:'7'},{id:'D',label:'8'}], correct: 'B' },
      { id: 93, text: "Which word is a type of fruit?", options: [{id:'A',label:'strawberry'},{id:'B',label:'carrot'},{id:'C',label:'potato'},{id:'D',label:'onion'}], correct: 'A' },
      { id: 94, text: "What is the cube of 3?", options: [{id:'A',label:'9'},{id:'B',label:'27'},{id:'C',label:'81'},{id:'D',label:'99'}], correct: 'B' },
      { id: 95, text: "Which one is a planet?", options: [{id:'A',label:'Jupiter'},{id:'B',label:'Pluto'},{id:'C',label:'Moon'},{id:'D',label:'Sun'}], correct: 'A' },
      { id: 96, text: "If you have 5 dimes, how many cents?", options: [{id:'A',label:'5'},{id:'B',label:'10'},{id:'C',label:'50'},{id:'D',label:'100'}], correct: 'C' },
      { id: 97, text: "Which letter is the 10th letter of the alphabet?", options: [{id:'A',label:'H'},{id:'B',label:'I'},{id:'C',label:'J'},{id:'D',label:'K'}], correct: 'C' },
      { id: 98, text: "What is the sum of angles in a triangle?", options: [{id:'A',label:'90'},{id:'B',label:'180'},{id:'C',label:'270'},{id:'D',label:'360'}], correct: 'B' },
      { id: 99, text: "Which one is a mode of transportation?", options: [{id:'A',label:'bicycle'},{id:'B',label:'tree'},{id:'C',label:'cloud'},{id:'D',label:'river'}], correct: 'A' },
      { id: 100, text: "What is 8 x 7?", options: [{id:'A',label:'54'},{id:'B',label:'56'},{id:'C',label:'58'},{id:'D',label:'60'}], correct: 'B' },
    ]
  },
  {
    name: "Level 6",
    questions: [
      { id: 101, text: "What comes next? 2, 3, 5, 9, 17, ?", options: [{id:'A',label:'31'},{id:'B',label:'33'},{id:'C',label:'35'},{id:'D',label:'37'}], correct: 'B' },
      { id: 102, text: "Which word is the odd one out? circle, square, triangle, sphere", options: [{id:'A',label:'circle'},{id:'B',label:'square'},{id:'C',label:'triangle'},{id:'D',label:'sphere'}], correct: 'D' },
      { id: 103, text: "If a clock shows 3:15, what is the angle between hour and minute hands?", options: [{id:'A',label:'0°'},{id:'B',label:'7.5°'},{id:'C',label:'15°'},{id:'D',label:'30°'}], correct: 'B' },
      { id: 104, text: "Which number is a perfect cube?", options: [{id:'A',label:'16'},{id:'B',label:'25'},{id:'C',label:'27'},{id:'D',label:'36'}], correct: 'C' },
      { id: 105, text: "Complete the analogy: Tree is to forest as star is to ?", options: [{id:'A',label:'sky'},{id:'B',label:'galaxy'},{id:'C',label:'universe'},{id:'D',label:'sun'}], correct: 'B' },
      { id: 106, text: "What is the square root of 144?", options: [{id:'A',label:'10'},{id:'B',label:'12'},{id:'C',label:'14'},{id:'D',label:'16'}], correct: 'B' },
      { id: 107, text: "Which one is a type of rock?", options: [{id:'A',label:'igneous'},{id:'B',label:'magma'},{id:'C',label:'lava'},{id:'D',label:'volcano'}], correct: 'A' },
      { id: 108, text: "How many faces does a cube have?", options: [{id:'A',label:'4'},{id:'B',label:'6'},{id:'C',label:'8'},{id:'D',label:'12'}], correct: 'B' },
      { id: 109, text: "Which word means the same as 'enormous'?", options: [{id:'A',label:'tiny'},{id:'B',label:'huge'},{id:'C',label:'medium'},{id:'D',label:'small'}], correct: 'B' },
      { id: 110, text: "What is 15% of 200?", options: [{id:'A',label:'15'},{id:'B',label:'30'},{id:'C',label:'35'},{id:'D',label:'40'}], correct: 'B' },
      { id: 111, text: "Which one is a programming paradigm?", options: [{id:'A',label:'object-oriented'},{id:'B',label:'linear'},{id:'C',label:'circular'},{id:'D',label:'triangular'}], correct: 'A' },
      { id: 112, text: "How many continents are there?", options: [{id:'A',label:'5'},{id:'B',label:'6'},{id:'C',label:'7'},{id:'D',label:'8'}], correct: 'C' },
      { id: 113, text: "Which one is a type of cloud?", options: [{id:'A',label:'cumulus'},{id:'B',label:'stratus'},{id:'C',label:'both'},{id:'D',label:'neither'}], correct: 'A' },
      { id: 114, text: "What is the next number? 1, 1, 2, 3, 5, 8, ?", options: [{id:'A',label:'11'},{id:'B',label:'12'},{id:'C',label:'13'},{id:'D',label:'14'}], correct: 'C' },
      { id: 115, text: "Which word is a palindrome?", options: [{id:'A',label:'racecar'},{id:'B',label:'banana'},{id:'C',label:'apple'},{id:'D',label:'orange'}], correct: 'A' },
      { id: 116, text: "What is the chemical symbol for gold?", options: [{id:'A',label:'Go'},{id:'B',label:'Gd'},{id:'C',label:'Au'},{id:'D',label:'Ag'}], correct: 'C' },
      { id: 117, text: "How many edges does a cube have?", options: [{id:'A',label:'6'},{id:'B',label:'8'},{id:'C',label:'12'},{id:'D',label:'16'}], correct: 'C' },
      { id: 118, text: "Which one is a type of energy?", options: [{id:'A',label:'kinetic'},{id:'B',label:'potential'},{id:'C',label:'both'},{id:'D',label:'neither'}], correct: 'A' },
      { id: 119, text: "If you have 3 apples and you take away 2, how many do you have?", options: [{id:'A',label:'1'},{id:'B',label:'2'},{id:'C',label:'3'},{id:'D',label:'5'}], correct: 'B' },
      { id: 120, text: "What is the Roman numeral for 50?", options: [{id:'A',label:'C'},{id:'B',label:'L'},{id:'C',label:'X'},{id:'D',label:'V'}], correct: 'B' },
    ]
  }
];

// ==================== SOUND MANAGER ====================
class SoundManager {
  static sounds = {};
  static loaded = false;

  static async loadSounds() {
    const soundFiles = {
      success: require('../../assets/sounds/success.mp3'),
      error: require('../../assets/sounds/error.mp3'),
      click: require('../../assets/sounds/click.mp3'),
      levelUp: require('../../assets/sounds/levelup.mp3'),
      gameComplete: require('../../assets/sounds/complete.mp3'),
    };

    for (const [key, file] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file, { volume: 0.5 });
        this.sounds[key] = sound;
      } catch (e) {
        // Silently ignore missing sounds
      }
    }
    this.loaded = true;
  }

  static async play(key) {
    if (!this.loaded) return;
    const sound = this.sounds[key];
    if (!sound) return;
    try {
      await sound.replayAsync();
    } catch (e) {}
  }

  static async setVolume(volume) {
    for (const sound of Object.values(this.sounds)) {
      if (!sound) continue;
      try {
        await sound.setVolumeAsync(volume);
      } catch (e) {}
    }
  }
}

// ==================== HAPTIC MANAGER ====================
const HapticManager = {
  light: () => Platform.OS === 'ios' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) : Vibration.vibrate(10),
  medium: () => Platform.OS === 'ios' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) : Vibration.vibrate(20),
  success: () => Platform.OS === 'ios' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Vibration.vibrate([0, 50, 50, 50]),
  error: () => Platform.OS === 'ios' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) : Vibration.vibrate([0, 100, 50, 100]),
};

// ==================== MAIN GAME COMPONENT ====================
export default function PuzzlePeakScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  
  // Game State
  const [gameState, setGameState] = useState("loading");
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [score, setScore] = useState(0);               // marks for current level (2 per correct)
  const [totalScoreAccumulated, setTotalScoreAccumulated] = useState(0); // across all levels
  const [attempts, setAttempts] = useState(0);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState(null);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentOptions, setCurrentOptions] = useState([]); // dynamic options for current question

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef(null);
  
  // Timer Ref
  const timerRef = useRef(null);
  const advanceTimer = useRef(null);

  // Responsive sizes
  const shapeSize = Math.min(width * 0.18, height * 0.1);
  const fontSize = {
    small: width * 0.03,
    medium: width * 0.04,
    large: width * 0.05,
    xlarge: width * 0.07,
  };

  // ==================== MEMOIZED VALUES ====================
  const currentLevel = LEVELS[levelIndex];
  const currentQuestion = currentLevel?.questions[questionIndex];
  
  const totalLevels = LEVELS.length;
  const totalQuestionsInLevel = currentLevel?.questions.length || 0;
  const totalQuestionsAll = LEVELS.reduce((acc, level) => acc + level.questions.length, 0);
  const totalPossibleAll = totalQuestionsAll * 2;

  // Helper to shuffle array (Fisher‑Yates)
  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Generate a new extra option (for wrong attempts) - only works for number options, but we have none.
  // We'll keep a simplified version that adds a dummy option if possible, but since all options are text,
  // we'll just shuffle. For simplicity, we'll not add extra options for text-based questions.
  const updateOptionsAfterWrong = () => {
    // Just shuffle current options
    setCurrentOptions(shuffleArray(currentOptions));
  };

  // Reset options for new question
  useEffect(() => {
    if (currentQuestion) {
      setCurrentOptions(shuffleArray(currentQuestion.options));
    }
  }, [currentQuestion]);

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    initializeGame();
    loadHighScore();
    loadSounds();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      startTimer();
      animateEntrance();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionIndex, levelIndex, gameState]);

  const initializeGame = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGameState("levelSelect");
  };

  const loadSounds = async () => {
    await SoundManager.loadSounds();
    setSoundsLoaded(true);
  };

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem('puzzlePeak_highScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {}
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem('puzzlePeak_highScore', newScore.toString());
    }
  };

  const startTimer = () => {
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    if (questionResolved) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    showFeedback("error", "⏰ Time's up!");
    HapticManager.error();
    if (!isMuted && soundsLoaded) SoundManager.play('error');
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= 3) {
      // Third wrong – question failed, move after delay
      setQuestionResolved(true);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
    } else {
      // Not yet 3 wrongs – shuffle options (no extra option for text)
      updateOptionsAfterWrong();
    }
  };

  const animateEntrance = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  };

  const showLevelUpMessage = (message) => {
    setLevelUpMessage(message);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setLevelUpMessage(null));
  };

  const advanceToNextQuestion = () => {
    if (questionIndex + 1 < totalQuestionsInLevel) {
      setQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setAttempts(0);
      setQuestionResolved(false);
      // options will reset via useEffect
    } else {
      // Level complete
      const newTotal = totalScoreAccumulated + score;
      setTotalScoreAccumulated(newTotal);
      saveHighScore(newTotal);
      
      if (levelIndex + 1 < totalLevels) {
        // More levels left
        setGameState("levelComplete");
        if (!isMuted && soundsLoaded) SoundManager.play('levelUp');
        if (confettiRef.current) confettiRef.current.play();
      } else {
        // All levels completed
        setGameState("gameComplete");
        if (!isMuted && soundsLoaded) SoundManager.play('gameComplete');
        if (confettiRef.current) confettiRef.current.play();
      }
    }
  };

  const handleOptionSelect = useCallback((optionId) => {
    if (gameState !== "playing" || questionResolved) return;
    setSelectedOptionId(optionId);
    HapticManager.light();
    if (!isMuted && soundsLoaded) SoundManager.play('click');
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [gameState, questionResolved, isMuted, soundsLoaded]);

  const handleCheckAnswer = useCallback(() => {
    if (gameState !== "playing" || !selectedOptionId || questionResolved) {
      if (!selectedOptionId) {
        showFeedback("warning", "👆 Select an answer first!");
        HapticManager.error();
        if (!isMuted && soundsLoaded) SoundManager.play('error');
      }
      return;
    }

    const isCorrect = selectedOptionId === currentQuestion.correct;

    if (isCorrect) {
      // Correct answer: +2 marks, resolve, move after delay
      if (timerRef.current) clearInterval(timerRef.current);
      setScore(prev => prev + 2);
      showFeedback("success", "🎉 +2 marks!");
      HapticManager.success();
      if (!isMuted && soundsLoaded) SoundManager.play('success');
      if (confettiRef.current) confettiRef.current.play();
      setQuestionResolved(true);

      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
    } else {
      // Wrong answer: increment attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      showFeedback("error", "❌ Try again!");
      HapticManager.error();
      if (!isMuted && soundsLoaded) SoundManager.play('error');

      if (newAttempts >= 3) {
        // Third wrong – question failed, move after delay
        if (timerRef.current) clearInterval(timerRef.current);
        setQuestionResolved(true);
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
      } else {
        // Not yet 3 wrongs – shuffle options
        updateOptionsAfterWrong();
      }

      // Shake animation on error
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [gameState, selectedOptionId, questionResolved, currentQuestion, attempts, isMuted, soundsLoaded]);

  const handleLevelSelect = (index) => {
    setLevelIndex(index);
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState("playing");
    HapticManager.success();
  };

  const handleRestartSameLevel = () => {
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState("playing");
  };

  const handleNextLevel = () => {
    if (levelIndex + 1 < totalLevels) {
      setLevelIndex(prev => prev + 1);
      setQuestionIndex(0);
      setScore(0);
      setAttempts(0);
      setQuestionResolved(false);
      setSelectedOptionId(null);
      setGameState("playing");
    }
  };

  const handleChangeLevel = () => {
    setGameState("levelSelect");
    setLevelIndex(0);
  };

  const handlePlayAgain = () => {
    setLevelIndex(0);
    setQuestionIndex(0);
    setScore(0);
    setTotalScoreAccumulated(0);
    setAttempts(0);
    setQuestionResolved(false);
    setSelectedOptionId(null);
    setGameState("playing");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    SoundManager.setVolume(isMuted ? 0.5 : 0);
  };

  // ==================== RENDER FUNCTIONS ====================
  if (gameState === "loading") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={[styles.loadingEmoji, { fontSize: fontSize.xlarge * 2 }]}>🧩🤔💡</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: fontSize.large }]}>Loading Puzzle Peak...</Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: "100%" }]} />
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === "levelSelect") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🧩 Puzzle Peak</Text>
        <Text style={[styles.welcomeSubtitle, { fontSize: fontSize.medium }]}>Choose a level!</Text>
        
        <ScrollView contentContainerStyle={styles.levelContainer} showsVerticalScrollIndicator={false}>
          {LEVELS.map((level, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.levelButton]}
              onPress={() => handleLevelSelect(idx)}
            >
              <Text style={[styles.levelButtonText, { fontSize: fontSize.large }]}>{level.name}</Text>
              <Text style={[styles.levelQuestions, { fontSize: fontSize.small }]}>{level.questions.length} questions</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.settingsIcon} onPress={() => setSettingsVisible(true)}>
          <Text style={[styles.settingsText, { fontSize: fontSize.large }]}>⚙️</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (gameState === "levelComplete") {
    const isNewRecord = totalScoreAccumulated > highScore;

    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
        
        <Text style={[styles.completeTitle, { fontSize: fontSize.xlarge }]}>🎉 Level Complete! 🎉</Text>
        <Text style={[styles.completeSubtitle, { fontSize: fontSize.medium }]}>You finished this level</Text>
        
        <View style={[styles.resultCard, { padding: width * 0.05 }]}>
          <Text style={[styles.resultScore, { fontSize: fontSize.large }]}>Marks: {score} / {totalQuestionsInLevel * 2}</Text>
          {isNewRecord && <Text style={[styles.newRecord, { fontSize: fontSize.medium }]}>🏆 NEW RECORD! 🏆</Text>}
          <Text style={[styles.resultStat, { fontSize: fontSize.small }]}>Total Marks: {totalScoreAccumulated} / {totalPossibleAll}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.homeButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Home</Text>
          </TouchableOpacity>
          
          {levelIndex + 1 < totalLevels && (
            <TouchableOpacity
              style={[styles.actionButton, styles.nextLevelButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
              onPress={handleNextLevel}
            >
              <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Next Level →</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === "gameComplete") {
    const isNewRecord = totalScoreAccumulated > highScore;

    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
        
        <Text style={[styles.completeTitle, { fontSize: fontSize.xlarge }]}>🏆 Game Complete! 🏆</Text>
        <Text style={[styles.completeSubtitle, { fontSize: fontSize.medium }]}>You finished all levels!</Text>
        
        <View style={[styles.resultCard, { padding: width * 0.05 }]}>
          <Text style={[styles.resultScore, { fontSize: fontSize.large }]}>Total Marks: {totalScoreAccumulated} / {totalPossibleAll}</Text>
          {isNewRecord && <Text style={[styles.newRecord, { fontSize: fontSize.medium }]}>🏆 NEW RECORD! 🏆</Text>}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playAgainButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={handlePlayAgain}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.homeButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text>Loading question...</Text>
      </SafeAreaView>
    );
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.1, 0, 0.1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const renderOptions = () => {
    return currentOptions.map((opt, idx) => {
      // All options are text objects
      const optionId = opt.id;
      const isSelected = selectedOptionId === optionId;

      return (
        <Animated.View
          key={idx}
          style={{
            transform: [
              { scale: isSelected ? scaleAnim : 1 },
              { rotate: rotateInterpolate }
            ]
          }}
        >
          <TouchableOpacity
            onPress={() => handleOptionSelect(optionId)}
            activeOpacity={0.7}
            disabled={questionResolved}
            style={[
              styles.optionTouch,
              { minWidth: width * 0.2, paddingHorizontal: 15, paddingVertical: 10 },
              isSelected && styles.optionSelected,
              questionResolved && styles.optionDisabled,
            ]}
          >
            <View style={[styles.textOption, { backgroundColor: COLORS.surface }]}>
              <Text style={[styles.optionText, { fontSize: fontSize.medium }]}>{opt.label}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={[styles.header, { height: height * 0.08 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { fontSize: fontSize.large }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.levelText, { fontSize: fontSize.small }]}>L{levelIndex+1}/{totalLevels} Q{questionIndex+1}/{totalQuestionsInLevel}</Text>
          <Text style={[styles.levelName, { fontSize: fontSize.small }]}>{currentLevel.name}</Text>
        </View>
        
        <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { fontSize: fontSize.large }]}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statsBar, { height: height * 0.06 }]}>
        <View style={styles.statBadge}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>⭐</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{score}</Text>
        </View>
        
        <View style={[styles.statBadge, timeLeft < 10 && styles.statBadgeWarning]}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>⏰</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{timeLeft}s</Text>
        </View>
        
        <View style={styles.statBadge}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>❓</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{attempts}/3</Text>
        </View>
      </View>

      <View style={[styles.questionSection, { height: height * 0.15 }]}>
        <Text style={[styles.questionText, { fontSize: fontSize.small }]}>{currentQuestion.text}</Text>
      </View>

      {levelUpMessage && (
        <Animated.View style={[styles.levelUpOverlay, { opacity: fadeAnim }]}>
          <Text style={[styles.levelUpText, { fontSize: fontSize.large }]}>{levelUpMessage}</Text>
        </Animated.View>
      )}

      {feedback && (
        <Animated.View style={[styles.feedbackOverlay, { opacity: fadeAnim }]}>
          <Text style={[
            styles.feedbackText,
            { fontSize: fontSize.large },
            feedback.type === 'success' && styles.feedbackSuccess,
            feedback.type === 'error' && styles.feedbackError,
            feedback.type === 'warning' && styles.feedbackWarning,
          ]}>
            {feedback.message}
          </Text>
        </Animated.View>
      )}

      <ScrollView 
        contentContainerStyle={styles.optionsGridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsGrid}>
          {renderOptions()}
        </View>
      </ScrollView>

      <View style={[styles.controls, { height: height * 0.08 }]}>
        <TouchableOpacity
          style={[styles.controlButton, styles.checkButton, { paddingVertical: height * 0.015 }]}
          onPress={handleCheckAnswer}
          activeOpacity={0.8}
          disabled={questionResolved}
        >
          <Text style={[styles.controlButtonText, { fontSize: fontSize.medium }]}>✓ Check</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.progressContainer, { height: height * 0.03 }]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((questionIndex + 1) / totalQuestionsInLevel) * 100}%` }
            ]}
          />
        </View>
      </View>

      <Modal visible={settingsVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: width * 0.8, padding: width * 0.05 }]}>
            <Text style={[styles.modalTitle, { fontSize: fontSize.large }]}>Settings</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={toggleMute}>
              <Text style={[styles.modalOptionText, { fontSize: fontSize.medium }]}>
                Sound: {isMuted ? '🔇 Off' : '🔊 On'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton, { paddingVertical: height * 0.015 }]}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={[styles.modalButtonText, { fontSize: fontSize.medium }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    marginBottom: 20,
  },
  loadingText: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 30,
  },
  levelContainer: {
    width: '90%',
    paddingVertical: 20,
    alignItems: 'center',
  },
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
  levelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  levelQuestions: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: COLORS.textLight,
    marginBottom: 30,
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  settingsText: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerButtonText: {},
  headerCenter: {
    alignItems: 'center',
  },
  levelText: {
    color: COLORS.textLight,
  },
  levelName: {
    fontWeight: '600',
    color: COLORS.text,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statBadgeWarning: {
    backgroundColor: COLORS.error + '20',
  },
  statBadgeIcon: {
    marginRight: 4,
  },
  statBadgeText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  questionSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  questionText: {
    color: COLORS.text,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  levelUpOverlay: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  levelUpText: {
    backgroundColor: COLORS.secondary + 'CC',
    color: COLORS.text,
    fontWeight: 'bold',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
    overflow: 'hidden',
  },
  optionsGridContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  optionTouch: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  optionSelected: {
    transform: [{ scale: 1.1 }],
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  shapeCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shapeEmoji: {},
  textOption: {
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 10,
  },
  controlButton: {
    flex: 0.5,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  checkButton: {
    backgroundColor: COLORS.success,
  },
  controlButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  feedbackText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  feedbackSuccess: {
    color: COLORS.success,
  },
  feedbackError: {
    color: COLORS.error,
  },
  feedbackWarning: {
    color: COLORS.accent,
  },
  confetti: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  completeTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  completeSubtitle: {
    color: COLORS.textLight,
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    width: '80%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  resultScore: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  newRecord: {
    color: COLORS.gold,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultStat: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 50,
    elevation: 3,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
  },
  nextLevelButton: {
    backgroundColor: COLORS.accent,
  },
  homeButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    color: COLORS.text,
  },
  modalButton: {
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  modalCloseButton: {
    backgroundColor: COLORS.secondary,
  },
  modalButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});