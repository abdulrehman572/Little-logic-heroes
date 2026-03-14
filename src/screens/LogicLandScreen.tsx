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

// ==================== LOGIC QUESTIONS ====================

// ==================== NEW LEVELS & QUESTIONS (120) ====================
// ==================== NEW LEVELS & QUESTIONS (120) ====================
const LEVELS = [
  {
    name: "Level 1",
    questions: [
      { id: 1, text: "Which one is a vegetable?", options: [{id: 'A', label: 'Carrot'}, {id: 'B', label: 'Apple'}, {id: 'C', label: 'Banana'}], correct: 'A' },
      { id: 2, text: "Which word is the odd one out?", options: [{id: 'A', label: 'Red'}, {id: 'B', label: 'Blue'}, {id: 'C', label: 'Big'}, {id: 'D', label: 'Green'}], correct: 'C' },
      { id: 3, text: "If all dogs bark, and Rex is a dog, then Rex?", options: [{id: 'A', label: 'barks'}, {id: 'B', label: 'meows'}, {id: 'C', label: 'flies'}], correct: 'A' },
      { id: 4, text: "What number comes next? 5, 10, 15, ?", options: [{id: 'A', label: '18'}, {id: 'B', label: '20'}, {id: 'C', label: '25'}], correct: 'B' },
      { id: 5, text: "Which one is a shape?", options: [{id: 'A', label: 'Circle'}, {id: 'B', label: 'Table'}, {id: 'C', label: 'Chair'}], correct: 'A' },
      { id: 6, text: "You have 4 candies and you give 2 away. How many left?", options: [{id: 'A', label: '1'}, {id: 'B', label: '2'}, {id: 'C', label: '3'}], correct: 'B' },
      { id: 7, text: "Which is a fruit?", options: [{id: 'A', label: 'Potato'}, {id: 'B', label: 'Strawberry'}, {id: 'C', label: 'Onion'}], correct: 'B' },
      { id: 8, text: "Complete: Sun, Monday, Tuesday, ?", options: [{id: 'A', label: 'Wednesday'}, {id: 'B', label: 'Thursday'}, {id: 'C', label: 'Friday'}], correct: 'A' },
      { id: 9, text: "Which is a number?", options: [{id: 'A', label: 'Seven'}, {id: 'B', label: 'House'}, {id: 'C', label: 'Tree'}], correct: 'A' },
      { id: 10, text: "If one book costs $5, how much do 2 books cost?", options: [{id: 'A', label: '$8'}, {id: 'B', label: '$10'}, {id: 'C', label: '$12'}], correct: 'B' },
      { id: 11, text: "Opposite of 'day' is?", options: [{id: 'A', label: 'Night'}, {id: 'B', label: 'Light'}, {id: 'C', label: 'Sun'}], correct: 'A' },
      { id: 12, text: "Missing number: 3, 6, 9, ?", options: [{id: 'A', label: '10'}, {id: 'B', label: '12'}, {id: 'C', label: '15'}], correct: 'B' },
      { id: 13, text: "Which animal is a mammal?", options: [{id: 'A', label: 'Fish'}, {id: 'B', label: 'Frog'}, {id: 'C', label: 'Cow'}], correct: 'C' },
      { id: 14, text: "You have 3 red and 2 blue marbles. Total marbles?", options: [{id: 'A', label: '4'}, {id: 'B', label: '5'}, {id: 'C', label: '6'}], correct: 'B' },
      { id: 15, text: "How many sides does a square have?", options: [{id: 'A', label: '3'}, {id: 'B', label: '4'}, {id: 'C', label: '5'}], correct: 'B' },
      { id: 16, text: "Next letter: D, E, F, ?", options: [{id: 'A', label: 'G'}, {id: 'B', label: 'H'}, {id: 'C', label: 'I'}], correct: 'A' },
      { id: 17, text: "Which is a vehicle?", options: [{id: 'A', label: 'Bicycle'}, {id: 'B', label: 'Desk'}, {id: 'C', label: 'Bed'}], correct: 'A' },
      { id: 18, text: "If yesterday was Thursday, what is today?", options: [{id: 'A', label: 'Friday'}, {id: 'B', label: 'Saturday'}, {id: 'C', label: 'Wednesday'}], correct: 'A' },
      { id: 19, text: "Smallest number: 45, 54, 35", options: [{id: 'A', label: '45'}, {id: 'B', label: '54'}, {id: 'C', label: '35'}], correct: 'C' },
      { id: 20, text: "Which word means the same as 'quick'?", options: [{id: 'A', label: 'Fast'}, {id: 'B', label: 'Slow'}, {id: 'C', label: 'Big'}], correct: 'A' },
    ]
  },
  {
    name: "Level 2",
    questions: [
      { id: 21, text: "Next number: 2, 5, 8, 11, ?", options: [{id: 'A', label: '13'}, {id: 'B', label: '14'}, {id: 'C', label: '15'}], correct: 'B' },
      { id: 22, text: "Complete: 3, 6, 12, 24, ?", options: [{id: 'A', label: '36'}, {id: 'B', label: '48'}, {id: 'C', label: '60'}], correct: 'B' },
      { id: 23, text: "Which shape has 5 sides?", options: [{id: 'A', label: 'Pentagon'}, {id: 'B', label: 'Hexagon'}, {id: 'C', label: 'Octagon'}], correct: 'A' },
      { id: 24, text: "Pattern: A, C, E, G, ?", options: [{id: 'A', label: 'H'}, {id: 'B', label: 'I'}, {id: 'C', label: 'J'}], correct: 'B' },
      { id: 25, text: "Next: 1, 4, 9, 16, ?", options: [{id: 'A', label: '20'}, {id: 'B', label: '24'}, {id: 'C', label: '25'}], correct: 'C' },
      { id: 26, text: "Which is a prime number?", options: [{id: 'A', label: '12'}, {id: 'B', label: '13'}, {id: 'C', label: '15'}], correct: 'B' },
      { id: 27, text: "What comes next? 1, 1, 2, 3, 5, ?", options: [{id: 'A', label: '7'}, {id: 'B', label: '8'}, {id: 'C', label: '9'}], correct: 'B' },
      { id: 28, text: "Which word is a verb?", options: [{id: 'A', label: 'Run'}, {id: 'B', label: 'Blue'}, {id: 'C', label: 'House'}], correct: 'A' },
      { id: 29, text: "If all squares are rectangles, then a square is always a ?", options: [{id: 'A', label: 'Rectangle'}, {id: 'B', label: 'Triangle'}, {id: 'C', label: 'Circle'}], correct: 'A' },
      { id: 30, text: "Missing: 18, 15, 12, 9, ?", options: [{id: 'A', label: '6'}, {id: 'B', label: '7'}, {id: 'C', label: '8'}], correct: 'A' },
      { id: 31, text: "Which animal lays eggs?", options: [{id: 'A', label: 'Dog'}, {id: 'B', label: 'Chicken'}, {id: 'C', label: 'Horse'}], correct: 'B' },
      { id: 32, text: "How many months have 31 days?", options: [{id: 'A', label: '6'}, {id: 'B', label: '7'}, {id: 'C', label: '8'}], correct: 'B' },
      { id: 33, text: "Which is the largest? 1/2, 1/3, 1/4", options: [{id: 'A', label: '1/2'}, {id: 'B', label: '1/3'}, {id: 'C', label: '1/4'}], correct: 'A' },
      { id: 34, text: "A triangle has how many angles?", options: [{id: 'A', label: '2'}, {id: 'B', label: '3'}, {id: 'C', label: '4'}], correct: 'B' },
      { id: 35, text: "Next: 2, 4, 8, 16, ?", options: [{id: 'A', label: '24'}, {id: 'B', label: '32'}, {id: 'C', label: '64'}], correct: 'B' },
      { id: 36, text: "Which is an odd number?", options: [{id: 'A', label: '22'}, {id: 'B', label: '33'}, {id: 'C', label: '44'}], correct: 'B' },
      { id: 37, text: "If a pen costs $2 and a notebook $3, total for both?", options: [{id: 'A', label: '$4'}, {id: 'B', label: '$5'}, {id: 'C', label: '$6'}], correct: 'B' },
      { id: 38, text: "Which is a continent?", options: [{id: 'A', label: 'Asia'}, {id: 'B', label: 'Atlantic'}, {id: 'C', label: 'Arctic'}], correct: 'A' },
      { id: 39, text: "How many eggs in a dozen?", options: [{id: 'A', label: '10'}, {id: 'B', label: '12'}, {id: 'C', label: '14'}], correct: 'B' },
      { id: 40, text: "Which word is a color?", options: [{id: 'A', label: 'Yellow'}, {id: 'B', label: 'Round'}, {id: 'C', label: 'Tall'}], correct: 'A' },
    ]
  },
  {
    name: "Level 3",
    questions: [
      { id: 41, text: "If some A are B, and all B are C, then which is true?", options: [{id: 'A', label: 'Some A are C'}, {id: 'B', label: 'All A are C'}, {id: 'C', label: 'No A are C'}], correct: 'A' },
      { id: 42, text: "You have 4 blue socks and 4 red socks in a drawer. How many must you take to guarantee a matching pair?", options: [{id: 'A', label: '2'}, {id: 'B', label: '3'}, {id: 'C', label: '4'}], correct: 'B' },
      { id: 43, text: "If the day after tomorrow is Sunday, what day is today?", options: [{id: 'A', label: 'Friday'}, {id: 'B', label: 'Saturday'}, {id: 'C', label: 'Thursday'}], correct: 'A' },
      { id: 44, text: "A pencil and an eraser cost $1.10. The pencil costs $1 more than the eraser. How much is the eraser?", options: [{id: 'A', label: '5 cents'}, {id: 'B', label: '10 cents'}, {id: 'C', label: '15 cents'}], correct: 'A' },
      { id: 45, text: "I have no doors but I have keys. What am I?", options: [{id: 'A', label: 'Piano'}, {id: 'B', label: 'Map'}, {id: 'C', label: 'Book'}], correct: 'A' },
      { id: 46, text: "Next: 3, 5, 9, 17, 33, ?", options: [{id: 'A', label: '65'}, {id: 'B', label: '63'}, {id: 'C', label: '67'}], correct: 'A' },
      { id: 47, text: "A farmer has 12 sheep. All but 5 die. How many left?", options: [{id: 'A', label: '5'}, {id: 'B', label: '7'}, {id: 'C', label: '12'}], correct: 'A' },
      { id: 48, text: "If you take 2 pills every half hour, how long will 6 pills last?", options: [{id: 'A', label: '1 hour'}, {id: 'B', label: '1.5 hours'}, {id: 'C', label: '2 hours'}], correct: 'B' },
      { id: 49, text: "Which word does not belong? Inch, Foot, Pound, Yard", options: [{id: 'A', label: 'Inch'}, {id: 'B', label: 'Pound'}, {id: 'C', label: 'Yard'}], correct: 'B' },
      { id: 50, text: "If you rearrange the letters 'C A R' you get?", options: [{id: 'A', label: 'Car'}, {id: 'B', label: 'Arc'}, {id: 'C', label: 'Rac'}], correct: 'A' },
      { id: 51, text: "Which number is different? 81, 64, 49, 36, 25, 18", options: [{id: 'A', label: '18'}, {id: 'B', label: '25'}, {id: 'C', label: '49'}], correct: 'A' },
      { id: 52, text: "If all A are B, and some B are not C, then which is true?", options: [{id: 'A', label: 'Some A are not C'}, {id: 'B', label: 'All A are C'}, {id: 'C', label: 'None necessarily'}], correct: 'C' },
      { id: 53, text: "A man is looking at a photo. He says, 'Brothers and sisters have I none, but that man's father is my father's son.' Who is in the photo?", options: [{id: 'A', label: 'His son'}, {id: 'B', label: 'His father'}, {id: 'C', label: 'Himself'}], correct: 'A' },
      { id: 54, text: "How many times can you subtract 5 from 25?", options: [{id: 'A', label: '5'}, {id: 'B', label: '1'}, {id: 'C', label: "Once (after that it's 20)"}], correct: 'C' },
      { id: 55, text: "Which is the heaviest: 1kg feathers, 1kg steel, 1kg cotton?", options: [{id: 'A', label: 'Steel'}, {id: 'B', label: 'Feathers'}, {id: 'C', label: 'Same'}], correct: 'C' },
      { id: 56, text: "If a clock shows 3:15, what is the angle between hour and minute hand?", options: [{id: 'A', label: '0°'}, {id: 'B', label: '7.5°'}, {id: 'C', label: '15°'}], correct: 'B' },
      { id: 57, text: "What is the next letter? J, F, M, A, M, ?", options: [{id: 'A', label: 'J'}, {id: 'B', label: 'A'}, {id: 'C', label: 'S'}], correct: 'A' },
      { id: 58, text: "Which word is the odd one out? Chair, Table, Sofa, Wood", options: [{id: 'A', label: 'Chair'}, {id: 'B', label: 'Table'}, {id: 'C', label: 'Wood'}], correct: 'C' },
      { id: 59, text: "If you have 3 apples and you take away 2, how many do you have?", options: [{id: 'A', label: '1'}, {id: 'B', label: '2'}, {id: 'C', label: '3'}], correct: 'B' },
      { id: 60, text: "A plane crashes on the border of USA and Canada. Where do they bury the survivors?", options: [{id: 'A', label: 'USA'}, {id: 'B', label: 'Canada'}, {id: 'C', label: 'Survivors are not buried'}], correct: 'C' },
    ]
  },
  {
    name: "Level 4",
    questions: [
      { id: 61, text: "All roses are flowers. Some flowers fade quickly. Therefore, some roses fade quickly. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 62, text: "If it is raining, then the ground is wet. The ground is wet. Therefore, it is raining. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 63, text: "If you study, you will pass. You did not pass. Therefore, you did not study. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'A' },
      { id: 64, text: "Some cats are black. Some black things are shiny. Therefore, some cats are shiny. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 65, text: "All squares are rectangles. All rectangles have four sides. Therefore, all squares have four sides. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'A' },
      { id: 66, text: "No birds are mammals. All bats are mammals. Therefore, no bats are birds. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'A' },
      { id: 67, text: "If it is a dog, then it is an animal. It is an animal. Therefore, it is a dog. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 68, text: "If it is a square, then it has four sides. It has four sides. Therefore, it is a square. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 69, text: "All A are B. All B are C. Therefore, all A are C. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'A' },
      { id: 70, text: "Some A are B. Some B are C. Therefore, some A are C. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 71, text: "No A are B. All B are C. Therefore, no A are C. Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 72, text: "Which is logically equivalent to 'If it rains, then the ground is wet'?", options: [{id: 'A', label: 'If ground wet then rain'}, {id: 'B', label: 'If not rain then not wet'}, {id: 'C', label: 'If not wet then not rain'}], correct: 'C' },
      { id: 73, text: "Contrapositive of 'If you eat healthy, you will live long' is:", options: [{id: 'A', label: 'If you live long then you eat healthy'}, {id: 'B', label: 'If you don\'t live long then you don\'t eat healthy'}, {id: 'C', label: 'If you don\'t eat healthy then you don\'t live long'}], correct: 'B' },
      { id: 74, text: "In a code, 'cat' is 'dbu'. What is 'dog'?", options: [{id: 'A', label: 'eph'}, {id: 'B', label: 'fqi'}, {id: 'C', label: 'epg'}], correct: 'A' },
      { id: 75, text: "If 'apple' is 'bqqmf', then 'orange' is?", options: [{id: 'A', label: 'psbohf'}, {id: 'B', label: 'psangf'}, {id: 'C', label: 'prbohf'}], correct: 'A' },
      { id: 76, text: "Odd one out: Mercury, Venus, Earth, Moon", options: [{id: 'A', label: 'Mercury'}, {id: 'B', label: 'Earth'}, {id: 'C', label: 'Moon'}], correct: 'C' },
      { id: 77, text: "If all bloops are goops, and some goops are floops, then necessarily?", options: [{id: 'A', label: 'All bloops are floops'}, {id: 'B', label: 'Some bloops are floops'}, {id: 'C', label: 'None'}], correct: 'C' },
      { id: 78, text: "A is taller than B, B is shorter than C, and A is shorter than C. Who is shortest?", options: [{id: 'A', label: 'A'}, {id: 'B', label: 'B'}, {id: 'C', label: 'C'}], correct: 'B' },
      { id: 79, text: "All squares are rectangles. Some rectangles are red. Some squares are red? Valid?", options: [{id: 'A', label: 'Yes'}, {id: 'B', label: 'No'}], correct: 'B' },
      { id: 80, text: "Next: 1, 11, 21, 1211, 111221, ?", options: [{id: 'A', label: '312211'}, {id: 'B', label: '111222'}, {id: 'C', label: '122211'}], correct: 'A' },
    ]
  },
  {
    name: "Level 5",
    questions: [
      { id: 81, text: "Knights (truth) and knaves (lie). A says: 'B is a knight.' B says: 'We are the same type.' What are A and B?", options: [{id: 'A', label: 'Both knights'}, {id: 'B', label: 'Both knaves'}, {id: 'C', label: 'A knight, B knave'}, {id: 'D', label: 'A knave, B knight'}], correct: 'B' },
      { id: 82, text: "Three boxes: Apples, Oranges, Both. All labels wrong. Pick one fruit from which box to determine all?", options: [{id: 'A', label: 'Apples'}, {id: 'B', label: 'Oranges'}, {id: 'C', label: 'Both'}], correct: 'C' },
      { id: 83, text: "I have two children. At least one is a boy. Probability both boys?", options: [{id: 'A', label: '1/2'}, {id: 'B', label: '1/3'}, {id: 'C', label: '1/4'}], correct: 'B' },
      { id: 84, text: "Roll two dice. Probability sum is 7?", options: [{id: 'A', label: '1/6'}, {id: 'B', label: '1/12'}, {id: 'C', label: '1/36'}], correct: 'A' },
      { id: 85, text: "You pass the person in second place. What place are you in?", options: [{id: 'A', label: 'First'}, {id: 'B', label: 'Second'}, {id: 'C', label: 'Third'}], correct: 'B' },
      { id: 86, text: "You pass the person in last place. What place are you in?", options: [{id: 'A', label: 'Last'}, {id: 'B', label: 'Second last'}, {id: 'C', label: 'Impossible'}], correct: 'C' },
      { id: 87, text: "A pen and pencil cost $1.20. Pen costs $1 more. Pencil cost?", options: [{id: 'A', label: '10¢'}, {id: 'B', label: '20¢'}, {id: 'C', label: '30¢'}], correct: 'A' },
      { id: 88, text: "How many times do clock hands overlap in a day?", options: [{id: 'A', label: '22'}, {id: 'B', label: '24'}, {id: 'C', label: '23'}], correct: 'A' },
      { id: 89, text: "If a rooster lays an egg on a peak, which way does it roll?", options: [{id: 'A', label: 'North'}, {id: 'B', label: 'South'}, {id: 'C', label: 'Roosters don\'t lay eggs'}], correct: 'C' },
      { id: 90, text: "3 and 5 gallon jugs. How to measure 1 gallon?", options: [{id: 'A', label: 'Fill 5, pour to 3, empty 3, pour remaining 2 to 3, fill 5, pour to 3 (leaves 4?)'}, {id: 'B', label: 'Fill 3, pour to 5, fill 3, pour to 5 until full (leaves 1 in 3)'}, {id: 'C', label: 'Fill 5, pour to 3 (leaves 2)'}], correct: 'B' },
      { id: 91, text: "9 coins, one heavier. Minimum weighings on balance scale?", options: [{id: 'A', label: '1'}, {id: 'B', label: '2'}, {id: 'C', label: '3'}], correct: 'B' },
      { id: 92, text: "12 coins, one counterfeit (lighter/heavier). Minimum weighings?", options: [{id: 'A', label: '2'}, {id: 'B', label: '3'}, {id: 'C', label: '4'}], correct: 'B' },
      { id: 93, text: "A plane crashes on US-Canada border. Where bury survivors?", options: [{id: 'A', label: 'US'}, {id: 'B', label: 'Canada'}, {id: 'C', label: 'Survivors not buried'}], correct: 'C' },
      { id: 94, text: "If red house made of red bricks, blue house blue bricks, yellow house yellow bricks, green house made of?", options: [{id: 'A', label: 'Green bricks'}, {id: 'B', label: 'Glass'}, {id: 'C', label: 'Wood'}], correct: 'B' },
      { id: 95, text: "O, T, T, F, F, S, S, ?", options: [{id: 'A', label: 'E'}, {id: 'B', label: 'N'}, {id: 'C', label: 'T'}], correct: 'A' },
      { id: 96, text: "16, 06, 68, 88, ?, 98", options: [{id: 'A', label: '78'}, {id: 'B', label: '87'}, {id: 'C', label: '86'}], correct: 'B' },
      { id: 97, text: "Man is 20 in 1980 but 15 in 1985. How?", options: [{id: 'A', label: 'Time travel'}, {id: 'B', label: 'He was born in 2000 BC'}, {id: 'C', label: 'Different calendar'}], correct: 'B' },
      { id: 98, text: "Cube painted, cut into 27. How many have paint on exactly 2 faces?", options: [{id: 'A', label: '8'}, {id: 'B', label: '12'}, {id: 'C', label: '16'}], correct: 'B' },
      { id: 99, text: "How many have paint on 3 faces?", options: [{id: 'A', label: '8'}, {id: 'B', label: '12'}, {id: 'C', label: '6'}], correct: 'A' },
      { id: 100, text: "How many squares in a 3x3 grid (including larger)?", options: [{id: 'A', label: '9'}, {id: 'B', label: '14'}, {id: 'C', label: '15'}], correct: 'B' },
    ]
  },
  {
    name: "Level 6",
    questions: [
      { id: 101, text: "Two doors, two guards: one truth, one lie. One door freedom, one death. Ask one question to one guard. Best question?", options: [{id: 'A', label: 'Which door is safe?'}, {id: 'B', label: 'What would the other guard say is safe?'}, {id: 'C', label: 'Is the left door safe?'}], correct: 'B' },
      { id: 102, text: "Smallest positive integer divisible by 1 to 10?", options: [{id: 'A', label: '2520'}, {id: 'B', label: '1260'}, {id: 'C', label: '5040'}], correct: 'A' },
      { id: 103, text: "Next: 2, 3, 5, 9, 17, ?", options: [{id: 'A', label: '31'}, {id: 'B', label: '33'}, {id: 'C', label: '35'}], correct: 'B' },
      { id: 104, text: "Next: 7, 10, 8, 11, 9, 12, ?", options: [{id: 'A', label: '10'}, {id: 'B', label: '11'}, {id: 'C', label: '13'}], correct: 'A' },
      { id: 105, text: "Circle is to sphere as square is to ?", options: [{id: 'A', label: 'Cube'}, {id: 'B', label: 'Rectangle'}, {id: 'C', label: 'Prism'}], correct: 'A' },
      { id: 106, text: "All Zips are Zaps. Some Zaps are Zops. Therefore, necessarily?", options: [{id: 'A', label: 'Some Zips are Zops'}, {id: 'B', label: 'All Zips are Zops'}, {id: 'C', label: 'None'}], correct: 'C' },
      { id: 107, text: "Man pushes car to hotel, tells owner he's bankrupt. Why?", options: [{id: 'A', label: 'Lost money'}, {id: 'B', label: 'Playing Monopoly'}, {id: 'C', label: 'Car broke'}], correct: 'B' },
      { id: 108, text: "What has keys but can't open locks?", options: [{id: 'A', label: 'Piano'}, {id: 'B', label: 'Keyboard'}, {id: 'C', label: 'Map'}], correct: 'A' },
      { id: 109, text: "I speak without a mouth, hear without ears. I have no body, but come alive with wind. What am I?", options: [{id: 'A', label: 'Echo'}, {id: 'B', label: 'Shadow'}, {id: 'C', label: 'Sound'}], correct: 'A' },
      { id: 110, text: "Boat filled with people, yet not a single person on board. How?", options: [{id: 'A', label: 'All married'}, {id: 'B', label: 'They are dead'}, {id: 'C', label: 'Ghost ship'}], correct: 'A' },
      { id: 111, text: "If you have me, you want to share me. If you share me, you no longer have me. What am I?", options: [{id: 'A', label: 'Secret'}, {id: 'B', label: 'Money'}, {id: 'C', label: 'Food'}], correct: 'A' },
      { id: 112, text: "Man looks at portrait: 'Brothers and sisters have I none, but that man's father is my father's son.' Who?", options: [{id: 'A', label: 'His son'}, {id: 'B', label: 'Himself'}, {id: 'C', label: 'His father'}], correct: 'A' },
      { id: 113, text: "Smallest number containing letter 'a' when spelled?", options: [{id: 'A', label: '100'}, {id: 'B', label: '1000'}, {id: 'C', label: '1,000,000'}], correct: 'B' },
      { id: 114, text: "Next: 1, 2, 3, 5, 7, 11, ?", options: [{id: 'A', label: '13'}, {id: 'B', label: '15'}, {id: 'C', label: '17'}], correct: 'A' },
      { id: 115, text: "Next: 1, 4, 27, 256, ?", options: [{id: 'A', label: '3125'}, {id: 'B', label: '625'}, {id: 'C', label: '1024'}], correct: 'A' },
      { id: 116, text: "If a quarter of 20 is 5, what is half of 10?", options: [{id: 'A', label: '5'}, {id: 'B', label: '2.5'}, {id: 'C', label: '10'}], correct: 'A' },
      { id: 117, text: "Snail climbs 3ft up, slips 2ft each night. Days to reach 10ft wall?", options: [{id: 'A', label: '8'}, {id: 'B', label: '10'}, {id: 'C', label: '7'}], correct: 'A' },
      { id: 118, text: "Two ropes each take 60 min to burn, unevenly. How measure 45 min?", options: [{id: 'A', label: 'Light both ends of rope A and one end of rope B'}, {id: 'B', label: 'Light both ends of both'}, {id: 'C', label: 'Light one end of one then the other'}], correct: 'A' },
      { id: 119, text: "Missing: 5, 8, 12, 17, 23, ?", options: [{id: 'A', label: '28'}, {id: 'B', label: '29'}, {id: 'C', label: '30'}], correct: 'C' },
      { id: 120, text: "Odd one out: red, blue, green, yellow, dark", options: [{id: 'A', label: 'red'}, {id: 'B', label: 'blue'}, {id: 'C', label: 'dark'}], correct: 'C' },
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
export default function LogicLandScreen() {
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
      const saved = await AsyncStorage.getItem('logicLand_highScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {}
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem('logicLand_highScore', newScore.toString());
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
      // Not yet 3 wrongs – just shuffle options (no extra option for text)
      setCurrentOptions(shuffleArray(currentOptions));
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
        // Not yet 3 wrongs – shuffle options (no extra option for text)
        setCurrentOptions(shuffleArray(currentOptions));
      }

      // Shake animation on error
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [gameState, selectedOptionId, questionResolved, currentQuestion, attempts, isMuted, soundsLoaded, currentOptions]);

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
          <Text style={[styles.loadingEmoji, { fontSize: fontSize.xlarge * 2 }]}>🧠💡</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: fontSize.large }]}>Loading Logic Land...</Text>
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
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🏰 Logic Land</Text>
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