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
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

// ==================== CONSTANTS & CONFIG ====================
const COLORS = {
  primary: '#A9D6E5',
  secondary: '#C0E8D5',
  accent: '#FFB347',
  purple: '#D4A5F0',
  pink: '#FCC0D0',
  teal: '#8EE3D0',
  background: '#F5F0E8',
  surface: '#FFFFFF',
  text: '#2E4057',
  textLight: '#5F6C7A',
  success: '#A8E6A8',
  error: '#F4A2A2',
  gold: '#F9D56E',
  shadow: '#000000',
};

// ==================== LEVELS & QUESTIONS ====================
// ==================== NEW LEVELS & QUESTIONS (120) ====================
// ==================== NEW LEVELS & QUESTIONS (120) ====================
const LEVELS = [
  {
    name: "Level 1",
    questions: [
      { id: 1, text: "Study: 🌳, 🐦. What comes after 🌳?", options: [{id: 'A', label: '🌳'}, {id: 'B', label: '🐦'}, {id: 'C', label: '☀️'}], correct: 'B' },
      { id: 2, text: "Study: 🍎, 🍌. What was the first fruit?", options: [{id: 'A', label: '🍎'}, {id: 'B', label: '🍌'}, {id: 'C', label: '🍇'}], correct: 'A' },
      { id: 3, text: "Study: ☁️, ☀️, 🌈. What is the last item?", options: [{id: 'A', label: '☁️'}, {id: 'B', label: '☀️'}, {id: 'C', label: '🌈'}], correct: 'C' },
      { id: 4, text: "Study: 🐝, 🦋. What was the second insect?", options: [{id: 'A', label: '🐝'}, {id: 'B', label: '🦋'}, {id: 'C', label: '🐞'}], correct: 'B' },
      { id: 5, text: "Study: 1, 2, 3. What number comes after 2?", options: [{id: 'A', label: '1'}, {id: 'B', label: '2'}, {id: 'C', label: '3'}], correct: 'C' },
      { id: 6, text: "Study: A, B. Which letter was first?", options: [{id: 'A', label: 'A'}, {id: 'B', label: 'B'}, {id: 'C', label: 'C'}], correct: 'A' },
      { id: 7, text: "Study: 🌼, 🌻, 🌺. What is in the middle?", options: [{id: 'A', label: '🌼'}, {id: 'B', label: '🌻'}, {id: 'C', label: '🌺'}], correct: 'B' },
      { id: 8, text: "Study: 🐶, 🐱, 🐭. What comes after 🐱?", options: [{id: 'A', label: '🐶'}, {id: 'B', label: '🐱'}, {id: 'C', label: '🐭'}], correct: 'C' },
      { id: 9, text: "Study: 🟥, 🟩. What was the second color?", options: [{id: 'A', label: '🟥'}, {id: 'B', label: '🟩'}, {id: 'C', label: '🟦'}], correct: 'B' },
      { id: 10, text: "Study: ★, ☆. How many items are there?", options: [{id: 'A', label: '1'}, {id: 'B', label: '2'}, {id: 'C', label: '3'}], correct: 'B' },
      { id: 11, text: "Study: 🍕, 🍔, 🍟. What was the third food?", options: [{id: 'A', label: '🍕'}, {id: 'B', label: '🍔'}, {id: 'C', label: '🍟'}], correct: 'C' },
      { id: 12, text: "Study: 3, 6, 9. What number came before 9?", options: [{id: 'A', label: '3'}, {id: 'B', label: '6'}, {id: 'C', label: '9'}], correct: 'B' },
      { id: 13, text: "Study: 🐘, 🦒. Which animal was second?", options: [{id: 'A', label: '🐘'}, {id: 'B', label: '🦒'}, {id: 'C', label: '🦏'}], correct: 'B' },
      { id: 14, text: "Study: 🚗, 🚲, 🚂. What is the first vehicle?", options: [{id: 'A', label: '🚗'}, {id: 'B', label: '🚲'}, {id: 'C', label: '🚂'}], correct: 'A' },
      { id: 15, text: "Study: 🔴, 🔵, 🟢. What color is in the middle?", options: [{id: 'A', label: '🔴'}, {id: 'B', label: '🔵'}, {id: 'C', label: '🟢'}], correct: 'B' },
      { id: 16, text: "Study: 2, 4, 6. What number comes after 4?", options: [{id: 'A', label: '2'}, {id: 'B', label: '4'}, {id: 'C', label: '6'}], correct: 'C' },
      { id: 17, text: "Study: 🎈, 🎁, 🎂. What was the last item?", options: [{id: 'A', label: '🎈'}, {id: 'B', label: '🎁'}, {id: 'C', label: '🎂'}], correct: 'C' },
      { id: 18, text: "Study: 🐠, 🐟. Which fish came first?", options: [{id: 'A', label: '🐠'}, {id: 'B', label: '🐟'}, {id: 'C', label: '🐡'}], correct: 'A' },
      { id: 19, text: "Study: 🌙, ⭐, ☀️. What comes after ⭐?", options: [{id: 'A', label: '🌙'}, {id: 'B', label: '⭐'}, {id: 'C', label: '☀️'}], correct: 'C' },
      { id: 20, text: "Study: 🍪, 🍩, 🧁. How many desserts are there?", options: [{id: 'A', label: '2'}, {id: 'B', label: '3'}, {id: 'C', label: '4'}], correct: 'B' },
    ]
  },
  {
    name: "Level 2",
    questions: [
      { id: 21, text: "Study: 🐭, 🐹, 🐰, 🦊. What comes after 🐹?", options: [{id: 'A', label: '🐭'}, {id: 'B', label: '🐰'}, {id: 'C', label: '🦊'}], correct: 'B' },
      { id: 22, text: "Study: 1, 3, 5, 7. What number was third?", options: [{id: 'A', label: '3'}, {id: 'B', label: '5'}, {id: 'C', label: '7'}], correct: 'B' },
      { id: 23, text: "Study: 🟣, 🟠, 🟡, 🟢. Which color is first?", options: [{id: 'A', label: '🟣'}, {id: 'B', label: '🟠'}, {id: 'C', label: '🟡'}], correct: 'A' },
      { id: 24, text: "Study: A, C, E, G. What letter comes after E?", options: [{id: 'A', label: 'C'}, {id: 'B', label: 'G'}, {id: 'C', label: 'F'}], correct: 'B' },
      { id: 25, text: "Study: 🍇, 🍈, 🍉, 🍊. What was the second fruit?", options: [{id: 'A', label: '🍇'}, {id: 'B', label: '🍈'}, {id: 'C', label: '🍉'}], correct: 'B' },
      { id: 26, text: "Study: 2, 4, 6, 8. What number comes before 8?", options: [{id: 'A', label: '4'}, {id: 'B', label: '6'}, {id: 'C', label: '2'}], correct: 'B' },
      { id: 27, text: "Study: 🐞, 🐜, 🐝, 🦋. Which bug is third?", options: [{id: 'A', label: '🐜'}, {id: 'B', label: '🐝'}, {id: 'C', label: '🦋'}], correct: 'B' },
      { id: 28, text: "Study: ☀️, 🌤️, ⛅, ☁️. What comes after ⛅?", options: [{id: 'A', label: '☀️'}, {id: 'B', label: '🌤️'}, {id: 'C', label: '☁️'}], correct: 'C' },
      { id: 29, text: "Study: 5, 10, 15, 20. What number was first?", options: [{id: 'A', label: '5'}, {id: 'B', label: '10'}, {id: 'C', label: '15'}], correct: 'A' },
      { id: 30, text: "Study: 🏀, ⚽, 🏐, 🏉. Which ball is last?", options: [{id: 'A', label: '🏀'}, {id: 'B', label: '🏐'}, {id: 'C', label: '🏉'}], correct: 'C' },
      { id: 31, text: "Study: 🐧, 🐦, 🐤, 🐥. What comes after 🐦?", options: [{id: 'A', label: '🐧'}, {id: 'B', label: '🐤'}, {id: 'C', label: '🐥'}], correct: 'B' },
      { id: 32, text: "Study: 3, 6, 9, 12. What number comes after 9?", options: [{id: 'A', label: '6'}, {id: 'B', label: '9'}, {id: 'C', label: '12'}], correct: 'C' },
      { id: 33, text: "Study: 🍎, 🍐, 🍊, 🍋. Which fruit is second?", options: [{id: 'A', label: '🍎'}, {id: 'B', label: '🍐'}, {id: 'C', label: '🍊'}], correct: 'B' },
      { id: 34, text: "Study: 🚣, 🏊, 🏄, 🚴. What activity comes after 🏊?", options: [{id: 'A', label: '🚣'}, {id: 'B', label: '🏄'}, {id: 'C', label: '🚴'}], correct: 'B' },
      { id: 35, text: "Study: 8, 7, 6, 5. What number was first?", options: [{id: 'A', label: '8'}, {id: 'B', label: '7'}, {id: 'C', label: '6'}], correct: 'A' },
      { id: 36, text: "Study: 🟨, 🟩, 🟦, 🟪. Which color is third?", options: [{id: 'A', label: '🟩'}, {id: 'B', label: '🟦'}, {id: 'C', label: '🟪'}], correct: 'B' },
      { id: 37, text: "Study: 🐫, 🐘, 🦒, 🦏. What animal comes after 🐘?", options: [{id: 'A', label: '🐫'}, {id: 'B', label: '🦒'}, {id: 'C', label: '🦏'}], correct: 'B' },
      { id: 38, text: "Study: 10, 20, 30, 40. What number was last?", options: [{id: 'A', label: '10'}, {id: 'B', label: '30'}, {id: 'C', label: '40'}], correct: 'C' },
      { id: 39, text: "Study: 🎻, 🎺, 🎷, 🥁. Which instrument is second?", options: [{id: 'A', label: '🎻'}, {id: 'B', label: '🎺'}, {id: 'C', label: '🎷'}], correct: 'B' },
      { id: 40, text: "Study: 2, 5, 8, 11. What number comes after 8?", options: [{id: 'A', label: '5'}, {id: 'B', label: '8'}, {id: 'C', label: '11'}], correct: 'C' },
    ]
  },
  {
    name: "Level 3",
    questions: [
      { id: 41, text: "Study: 🐨, 🐼, 🐻, 🦊, 🐰. What animal is in the middle?", options: [{id: 'A', label: '🐼'}, {id: 'B', label: '🐻'}, {id: 'C', label: '🦊'}], correct: 'B' },
      { id: 42, text: "Study: 1, 4, 9, 16, 25. What number was third?", options: [{id: 'A', label: '4'}, {id: 'B', label: '9'}, {id: 'C', label: '16'}], correct: 'B' },
      { id: 43, text: "Study: 🍏, 🍎, 🍐, 🍊, 🍋. Which fruit comes after 🍎?", options: [{id: 'A', label: '🍏'}, {id: 'B', label: '🍐'}, {id: 'C', label: '🍊'}], correct: 'B' },
      { id: 44, text: "Study: 🔴, 🟠, 🟡, 🟢, 🔵. What color is fourth?", options: [{id: 'A', label: '🟡'}, {id: 'B', label: '🟢'}, {id: 'C', label: '🔵'}], correct: 'B' },
      { id: 45, text: "Study: 2, 3, 5, 7, 11. What number comes before 7?", options: [{id: 'A', label: '3'}, {id: 'B', label: '5'}, {id: 'C', label: '11'}], correct: 'B' },
      { id: 46, text: "Study: 🦁, 🐯, 🐻, 🐨, 🐼. Which animal is second?", options: [{id: 'A', label: '🦁'}, {id: 'B', label: '🐯'}, {id: 'C', label: '🐻'}], correct: 'B' },
      { id: 47, text: "Study: 5, 10, 20, 40, 80. What number comes after 40?", options: [{id: 'A', label: '20'}, {id: 'B', label: '40'}, {id: 'C', label: '80'}], correct: 'C' },
      { id: 48, text: "Study: 🎄, 🎋, 🎍, 🎀, 🎁. What item is third?", options: [{id: 'A', label: '🎋'}, {id: 'B', label: '🎍'}, {id: 'C', label: '🎀'}], correct: 'B' },
      { id: 49, text: "Study: 🟩, 🟦, 🟪, 🟫, ⬛. Which color is last?", options: [{id: 'A', label: '🟪'}, {id: 'B', label: '🟫'}, {id: 'C', label: '⬛'}], correct: 'C' },
      { id: 50, text: "Study: 8, 6, 4, 2, 0. What number was first?", options: [{id: 'A', label: '8'}, {id: 'B', label: '6'}, {id: 'C', label: '4'}], correct: 'A' },
      { id: 51, text: "Study: 🐳, 🐬, 🐟, 🐠, 🐡. Which sea creature comes after 🐟?", options: [{id: 'A', label: '🐬'}, {id: 'B', label: '🐠'}, {id: 'C', label: '🐡'}], correct: 'B' },
      { id: 52, text: "Study: 3, 5, 8, 12, 17. What number is fourth?", options: [{id: 'A', label: '8'}, {id: 'B', label: '12'}, {id: 'C', label: '17'}], correct: 'B' },
      { id: 53, text: "Study: 🥇, 🥈, 🥉, 🏅, 🎖️. Which medal is second?", options: [{id: 'A', label: '🥇'}, {id: 'B', label: '🥈'}, {id: 'C', label: '🥉'}], correct: 'B' },
      { id: 54, text: "Study: 🟥, 🟧, 🟨, 🟩, 🟦, 🟪. What color comes after 🟩?", options: [{id: 'A', label: '🟨'}, {id: 'B', label: '🟦'}, {id: 'C', label: '🟪'}], correct: 'B' },
      { id: 55, text: "Study: 1, 1, 2, 3, 5, 8. What number was fifth?", options: [{id: 'A', label: '3'}, {id: 'B', label: '5'}, {id: 'C', label: '8'}], correct: 'B' },
      { id: 56, text: "Study: 🐜, 🐝, 🦋, 🐞, 🦗. Which insect is in the middle (third)?", options: [{id: 'A', label: '🐝'}, {id: 'B', label: '🦋'}, {id: 'C', label: '🐞'}], correct: 'B' },
      { id: 57, text: "Study: 12, 10, 8, 6, 4. What number comes after 8?", options: [{id: 'A', label: '10'}, {id: 'B', label: '6'}, {id: 'C', label: '4'}], correct: 'B' },
      { id: 58, text: "Study: 🚀, 🛸, 🛰️, 🌠, 🌌. What is the fourth item?", options: [{id: 'A', label: '🛰️'}, {id: 'B', label: '🌠'}, {id: 'C', label: '🌌'}], correct: 'B' },
      { id: 59, text: "Study: A, C, F, J, O. What letter comes after J?", options: [{id: 'A', label: 'C'}, {id: 'B', label: 'F'}, {id: 'C', label: 'O'}], correct: 'C' },
      { id: 60, text: "Study: 2, 6, 12, 20, 30. What number was third?", options: [{id: 'A', label: '6'}, {id: 'B', label: '12'}, {id: 'C', label: '20'}], correct: 'B' },
    ]
  },
  {
    name: "Level 4",
    questions: [
      { id: 61, text: "Study: 🐫, 🐪, 🐘, 🦏, 🦛, 🦒. What animal comes after 🦏?", options: [{id: 'A', label: '🐘'}, {id: 'B', label: '🦛'}, {id: 'C', label: '🦒'}], correct: 'B' },
      { id: 62, text: "Study: 1, 8, 27, 64, 125, 216. What number is fourth?", options: [{id: 'A', label: '27'}, {id: 'B', label: '64'}, {id: 'C', label: '125'}], correct: 'B' },
      { id: 63, text: "Study: 🍅, 🍆, 🥑, 🥦, 🥬, 🥒. Which vegetable is third?", options: [{id: 'A', label: '🍆'}, {id: 'B', label: '🥑'}, {id: 'C', label: '🥦'}], correct: 'B' },
      { id: 64, text: "Study: 3, 6, 11, 18, 27, 38. What number comes after 27?", options: [{id: 'A', label: '18'}, {id: 'B', label: '27'}, {id: 'C', label: '38'}], correct: 'C' },
      { id: 65, text: "Study: 🏔️, 🏕️, 🏖️, 🏜️, 🏝️, 🏞️. Which place is fifth?", options: [{id: 'A', label: '🏜️'}, {id: 'B', label: '🏝️'}, {id: 'C', label: '🏞️'}], correct: 'B' },
      { id: 66, text: "Study: 5, 9, 13, 17, 21, 25. What number was second?", options: [{id: 'A', label: '5'}, {id: 'B', label: '9'}, {id: 'C', label: '13'}], correct: 'B' },
      { id: 67, text: "Study: 🐞, 🐜, 🐝, 🦋, 🦗, 🕷️. Which bug comes after 🦋?", options: [{id: 'A', label: '🐝'}, {id: 'B', label: '🦗'}, {id: 'C', label: '🕷️'}], correct: 'B' },
      { id: 68, text: "Study: 2, 3, 5, 7, 11, 13, 17. What number is sixth?", options: [{id: 'A', label: '11'}, {id: 'B', label: '13'}, {id: 'C', label: '17'}], correct: 'B' },
      { id: 69, text: "Study: 🎬, 🎭, 🎪, 🎨, 🎵, 🎶. Which art is fourth?", options: [{id: 'A', label: '🎪'}, {id: 'B', label: '🎨'}, {id: 'C', label: '🎵'}], correct: 'B' },
      { id: 70, text: "Study: 100, 90, 80, 70, 60, 50. What number comes before 70?", options: [{id: 'A', label: '90'}, {id: 'B', label: '80'}, {id: 'C', label: '60'}], correct: 'B' },
      { id: 71, text: "Study: 🐉, 🐲, 🐍, 🐊, 🐢, 🦎. Which reptile is third?", options: [{id: 'A', label: '🐲'}, {id: 'B', label: '🐍'}, {id: 'C', label: '🐊'}], correct: 'B' },
      { id: 72, text: "Study: 1, 4, 10, 22, 46, 94. What number is fifth?", options: [{id: 'A', label: '22'}, {id: 'B', label: '46'}, {id: 'C', label: '94'}], correct: 'B' },
      { id: 73, text: "Study: 🎡, 🎢, 🎠, 🎪, 🎭, 🎬. What comes after 🎪?", options: [{id: 'A', label: '🎠'}, {id: 'B', label: '🎭'}, {id: 'C', label: '🎬'}], correct: 'B' },
      { id: 74, text: "Study: 2, 5, 10, 17, 26, 37. What number was second to last?", options: [{id: 'A', label: '17'}, {id: 'B', label: '26'}, {id: 'C', label: '37'}], correct: 'B' },
      { id: 75, text: "Study: 🦁, 🐯, 🐻, 🐺, 🦊, 🐨. Which animal is fourth?", options: [{id: 'A', label: '🐻'}, {id: 'B', label: '🐺'}, {id: 'C', label: '🦊'}], correct: 'B' },
      { id: 76, text: "Study: 3, 8, 15, 24, 35, 48. What number comes after 35?", options: [{id: 'A', label: '24'}, {id: 'B', label: '35'}, {id: 'C', label: '48'}], correct: 'C' },
      { id: 77, text: "Study: 🧩, 🎲, ♟️, 🃏, 🀄, 🎯. Which game is third?", options: [{id: 'A', label: '🎲'}, {id: 'B', label: '♟️'}, {id: 'C', label: '🃏'}], correct: 'B' },
      { id: 78, text: "Study: 1, 2, 4, 8, 16, 32, 64. What number is fifth?", options: [{id: 'A', label: '8'}, {id: 'B', label: '16'}, {id: 'C', label: '32'}], correct: 'B' },
      { id: 79, text: "Study: 🌑, 🌒, 🌓, 🌔, 🌕, 🌖. What phase comes after 🌔?", options: [{id: 'A', label: '🌓'}, {id: 'B', label: '🌕'}, {id: 'C', label: '🌖'}], correct: 'B' },
      { id: 80, text: "Study: 4, 9, 19, 39, 79, 159. What number was third?", options: [{id: 'A', label: '9'}, {id: 'B', label: '19'}, {id: 'C', label: '39'}], correct: 'B' },
    ]
  },
  {
    name: "Level 5",
    questions: [
      { id: 81, text: "Study: 2, 6, 30, 260, 3130. What number comes after 260? (tricky)", options: [{id: 'A', label: '30'}, {id: 'B', label: '260'}, {id: 'C', label: '3130'}], correct: 'C' },
      { id: 82, text: "Study: 🧙, 🧚, 🧛, 🧟, 🧝, 🧞, 🧜. Which character is fifth?", options: [{id: 'A', label: '🧟'}, {id: 'B', label: '🧝'}, {id: 'C', label: '🧞'}], correct: 'B' },
      { id: 83, text: "Study: 1, 2, 6, 24, 120, 720. What number was fourth?", options: [{id: 'A', label: '6'}, {id: 'B', label: '24'}, {id: 'C', label: '120'}], correct: 'B' },
      { id: 84, text: "Study: 🟨, 🟧, 🟥, 🟪, 🟦, 🟩, 🟫. What color comes after 🟪?", options: [{id: 'A', label: '🟥'}, {id: 'B', label: '🟦'}, {id: 'C', label: '🟩'}], correct: 'B' },
      { id: 85, text: "Study: 3, 7, 15, 31, 63, 127. What number is sixth?", options: [{id: 'A', label: '63'}, {id: 'B', label: '127'}, {id: 'C', label: '255'}], correct: 'B' },
      { id: 86, text: "Study: 🐨, 🐼, 🐻, 🦊, 🐰, 🐹, 🐭. Which animal is third from last?", options: [{id: 'A', label: '🦊'}, {id: 'B', label: '🐰'}, {id: 'C', label: '🐹'}], correct: 'B' },
      { id: 87, text: "Study: 5, 11, 23, 47, 95, 191. What number was second?", options: [{id: 'A', label: '5'}, {id: 'B', label: '11'}, {id: 'C', label: '23'}], correct: 'B' },
      { id: 88, text: "Study: 🚲, 🛵, 🚗, 🚕, 🚙, 🚌, 🚎. Which vehicle is fourth?", options: [{id: 'A', label: '🚗'}, {id: 'B', label: '🚕'}, {id: 'C', label: '🚙'}], correct: 'B' },
      { id: 89, text: "Study: 1, 3, 7, 13, 21, 31, 43. What number comes after 31?", options: [{id: 'A', label: '21'}, {id: 'B', label: '31'}, {id: 'C', label: '43'}], correct: 'C' },
      { id: 90, text: "Study: 🍇, 🍈, 🍉, 🍊, 🍋, 🍌, 🍍. Which fruit is third?", options: [{id: 'A', label: '🍈'}, {id: 'B', label: '🍉'}, {id: 'C', label: '🍊'}], correct: 'B' },
      { id: 91, text: "Study: 8, 27, 64, 125, 216, 343. What number is fifth?", options: [{id: 'A', label: '125'}, {id: 'B', label: '216'}, {id: 'C', label: '343'}], correct: 'B' },
      { id: 92, text: "Study: 🦅, 🦉, 🦜, 🦢, 🦩, 🦚, 🦃. Which bird comes after 🦢?", options: [{id: 'A', label: '🦜'}, {id: 'B', label: '🦩'}, {id: 'C', label: '🦚'}], correct: 'B' },
      { id: 93, text: "Study: 2, 3, 5, 9, 17, 33, 65. What number was sixth?", options: [{id: 'A', label: '17'}, {id: 'B', label: '33'}, {id: 'C', label: '65'}], correct: 'B' },
      { id: 94, text: "Study: 🇫🇷, 🇩🇪, 🇮🇹, 🇪🇸, 🇵🇹, 🇬🇷, 🇳🇱. Which flag is fourth?", options: [{id: 'A', label: '🇮🇹'}, {id: 'B', label: '🇪🇸'}, {id: 'C', label: '🇵🇹'}], correct: 'B' },
      { id: 95, text: "Study: 1, 1, 2, 3, 5, 8, 13, 21. What number is seventh?", options: [{id: 'A', label: '8'}, {id: 'B', label: '13'}, {id: 'C', label: '21'}], correct: 'B' },
      { id: 96, text: "Study: 🐋, 🐬, 🐟, 🐠, 🐡, 🐙, 🦑. Which sea creature comes after 🐡?", options: [{id: 'A', label: '🐠'}, {id: 'B', label: '🐙'}, {id: 'C', label: '🦑'}], correct: 'B' },
      { id: 97, text: "Study: 4, 12, 36, 108, 324, 972. What number was third?", options: [{id: 'A', label: '12'}, {id: 'B', label: '36'}, {id: 'C', label: '108'}], correct: 'B' },
      { id: 98, text: "Study: 🎻, 🎺, 🎷, 🥁, 🎸, 🎹, 🎵. Which instrument is fifth?", options: [{id: 'A', label: '🥁'}, {id: 'B', label: '🎸'}, {id: 'C', label: '🎹'}], correct: 'B' },
      { id: 99, text: "Study: 11, 13, 17, 19, 23, 29, 31. What number comes after 29?", options: [{id: 'A', label: '23'}, {id: 'B', label: '29'}, {id: 'C', label: '31'}], correct: 'C' },
      { id: 100, text: "Study: 🏀, ⚽, 🏐, 🏉, 🎾, 🏓, 🏒. Which sport is sixth?", options: [{id: 'A', label: '🎾'}, {id: 'B', label: '🏓'}, {id: 'C', label: '🏒'}], correct: 'B' },
    ]
  },
  {
    name: "Level 6",
    questions: [
      { id: 101, text: "Study: 1, 5, 13, 29, 61, 125, 253. What number is sixth?", options: [{id: 'A', label: '61'}, {id: 'B', label: '125'}, {id: 'C', label: '253'}], correct: 'B' },
      { id: 102, text: "Study: 🐉, 🐲, 🐍, 🐊, 🐢, 🦎, 🐸. Which reptile is fourth?", options: [{id: 'A', label: '🐍'}, {id: 'B', label: '🐊'}, {id: 'C', label: '🐢'}], correct: 'B' },
      { id: 103, text: "Study: 2, 6, 12, 20, 30, 42, 56. What number was fifth?", options: [{id: 'A', label: '20'}, {id: 'B', label: '30'}, {id: 'C', label: '42'}], correct: 'B' },
      { id: 104, text: "Study: 🟥, 🟧, 🟨, 🟩, 🟦, 🟪, 🟫, ⬛. What color comes after 🟪?", options: [{id: 'A', label: '🟦'}, {id: 'B', label: '🟫'}, {id: 'C', label: '⬛'}], correct: 'B' },
      { id: 105, text: "Study: 3, 5, 11, 29, 83, 245, 731. What number is sixth?", options: [{id: 'A', label: '83'}, {id: 'B', label: '245'}, {id: 'C', label: '731'}], correct: 'B' },
      { id: 106, text: "Study: 🐫, 🐪, 🐘, 🦏, 🦛, 🦒, 🐃, 🐂. Which animal is third from last?", options: [{id: 'A', label: '🦛'}, {id: 'B', label: '🦒'}, {id: 'C', label: '🐃'}], correct: 'B' },
      { id: 107, text: "Study: 1, 2, 4, 7, 11, 16, 22, 29. What number was seventh?", options: [{id: 'A', label: '16'}, {id: 'B', label: '22'}, {id: 'C', label: '29'}], correct: 'B' },
      { id: 108, text: "Study: 🏔️, 🏕️, 🏖️, 🏜️, 🏝️, 🏞️, 🏟️, 🏛️. Which place is fifth?", options: [{id: 'A', label: '🏜️'}, {id: 'B', label: '🏝️'}, {id: 'C', label: '🏞️'}], correct: 'B' },
      { id: 109, text: "Study: 2, 3, 7, 43, 1807, ... (huge). What number was fourth? (pattern: multiply previous and add something) – just recall position", options: [{id: 'A', label: '7'}, {id: 'B', label: '43'}, {id: 'C', label: '1807'}], correct: 'B' },
      { id: 110, text: "Study: 🐞, 🐜, 🐝, 🦋, 🦗, 🕷️, 🦂, 🦟. Which bug is sixth?", options: [{id: 'A', label: '🦗'}, {id: 'B', label: '🕷️'}, {id: 'C', label: '🦂'}], correct: 'B' },
      { id: 111, text: "Study: 1, 8, 27, 64, 125, 216, 343, 512. What number was seventh?", options: [{id: 'A', label: '216'}, {id: 'B', label: '343'}, {id: 'C', label: '512'}], correct: 'B' },
      { id: 112, text: "Study: 🦁, 🐯, 🐻, 🐺, 🦊, 🐨, 🐼, 🦝. Which animal comes after 🐨?", options: [{id: 'A', label: '🦊'}, {id: 'B', label: '🐼'}, {id: 'C', label: '🦝'}], correct: 'B' },
      { id: 113, text: "Study: 5, 14, 41, 122, 365, 1094, 3281. What number was fifth?", options: [{id: 'A', label: '122'}, {id: 'B', label: '365'}, {id: 'C', label: '1094'}], correct: 'B' },
      { id: 114, text: "Study: 🍇, 🍈, 🍉, 🍊, 🍋, 🍌, 🍍, 🥭. Which fruit is fourth?", options: [{id: 'A', label: '🍉'}, {id: 'B', label: '🍊'}, {id: 'C', label: '🍋'}], correct: 'B' },
      { id: 115, text: "Study: 1, 1, 2, 3, 5, 8, 13, 21, 34. What number was eighth?", options: [{id: 'A', label: '13'}, {id: 'B', label: '21'}, {id: 'C', label: '34'}], correct: 'B' },
      { id: 116, text: "Study: 🇺🇸, 🇬🇧, 🇨🇦, 🇦🇺, 🇯🇵, 🇫🇷, 🇩🇪, 🇮🇹. Which flag is sixth?", options: [{id: 'A', label: '🇯🇵'}, {id: 'B', label: '🇫🇷'}, {id: 'C', label: '🇩🇪'}], correct: 'B' },
      { id: 117, text: "Study: 2, 4, 8, 16, 32, 64, 128, 256. What number was fifth?", options: [{id: 'A', label: '16'}, {id: 'B', label: '32'}, {id: 'C', label: '64'}], correct: 'B' },
      { id: 118, text: "Study: 🚣, 🏊, 🏄, 🏂, 🏋️, 🚴, 🏃, 🤸. Which activity is seventh?", options: [{id: 'A', label: '🏋️'}, {id: 'B', label: '🚴'}, {id: 'C', label: '🏃'}], correct: 'B' },
      { id: 119, text: "Study: 3, 9, 27, 81, 243, 729, 2187. What number was sixth?", options: [{id: 'A', label: '243'}, {id: 'B', label: '729'}, {id: 'C', label: '2187'}], correct: 'B' },
      { id: 120, text: "Study: 🥇, 🥈, 🥉, 🏅, 🎖️, 🏆, 🥇, 🥈. What medal is seventh?", options: [{id: 'A', label: '🏆'}, {id: 'B', label: '🥇'}, {id: 'C', label: '🥈'}], correct: 'B' },
    ]
  }
];
// ==================== SOUND MANAGER (with improved error logging) ====================
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
        console.log(`Sound loaded: ${key}`);
      } catch (e) {
        console.warn(`Failed to load sound: ${key}`, e.message);
      }
    }
    this.loaded = true;
  }

  static async play(key) {
    if (!this.loaded) return;
    const sound = this.sounds[key];
    if (!sound) {
      console.warn(`Sound not available: ${key}`);
      return;
    }
    try {
      await sound.replayAsync();
    } catch (e) {
      console.warn(`Error playing sound: ${key}`, e.message);
    }
  }

  static async setVolume(volume) {
    for (const [key, sound] of Object.entries(this.sounds)) {
      if (!sound) continue;
      try {
        await sound.setVolumeAsync(volume);
      } catch (e) {
        console.warn(`Error setting volume for ${key}`, e.message);
      }
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
export default function MemoryMeadowScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  
  // Game State
  const [gameState, setGameState] = useState("loading");
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [score, setScore] = useState(0);
  const [totalScoreAccumulated, setTotalScoreAccumulated] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState(null);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentOptions, setCurrentOptions] = useState([]);

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

  // ==================== TEXT-TO-SPEECH FUNCTIONS ====================
  const speakText = useCallback((text) => {
    if (!text) return;
    try {
      Speech.speak(text, {
        language: 'en',
        pitch: 1,
        rate: 0.9,
      });
    } catch (error) {
      console.log('Speech error:', error);
    }
  }, []);

  const speakQuestion = useCallback(() => {
    if (currentQuestion) {
      speakText(currentQuestion.text);
    }
  }, [currentQuestion, speakText]);

  const speakOption = useCallback((optionLabel) => {
    speakText(optionLabel);
  }, [speakText]);

  // ==================== MEMOIZED VALUES ====================
  const currentLevel = LEVELS[levelIndex];
  const currentQuestion = currentLevel?.questions[questionIndex];
  
  const totalLevels = LEVELS.length;
  const totalQuestionsInLevel = currentLevel?.questions.length || 0;
  const totalQuestionsAll = LEVELS.reduce((acc, level) => acc + level.questions.length, 0);
  const totalPossibleAll = totalQuestionsAll * 2;

  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const updateOptionsAfterWrong = () => {
    if (!currentQuestion) return;
    setCurrentOptions(shuffleArray(currentOptions));
  };

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
      const saved = await AsyncStorage.getItem('memoryMeadow_highScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {}
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem('memoryMeadow_highScore', newScore.toString());
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
      setQuestionResolved(true);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
    } else {
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
    } else {
      const newTotal = totalScoreAccumulated + score;
      setTotalScoreAccumulated(newTotal);
      saveHighScore(newTotal);
      
      if (levelIndex + 1 < totalLevels) {
        setGameState("levelComplete");
        if (!isMuted && soundsLoaded) SoundManager.play('levelUp');
        if (confettiRef.current) confettiRef.current.play();
      } else {
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
    
    const selectedOption = currentOptions.find(opt => opt.id === optionId);
    if (selectedOption) {
      speakOption(selectedOption.label);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [gameState, questionResolved, isMuted, soundsLoaded, currentOptions, speakOption]);

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
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      showFeedback("error", "❌ Try again!");
      HapticManager.error();
      if (!isMuted && soundsLoaded) SoundManager.play('error');

      if (newAttempts >= 3) {
        if (timerRef.current) clearInterval(timerRef.current);
        setQuestionResolved(true);
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => advanceToNextQuestion(), 1000);
      } else {
        updateOptionsAfterWrong();
      }

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

  // ==================== RENDER ====================
  if (gameState === "loading") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={[styles.loadingEmoji, { fontSize: fontSize.xlarge * 2 }]}>🧠🌿</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: fontSize.large }]}>Loading Memory Meadow...</Text>
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
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🌿 Memory Meadow</Text>
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

      {/* Question area tappable for speech */}
      <TouchableOpacity 
        style={[styles.questionSection, { height: height * 0.15 }]} 
        onPress={speakQuestion}
        activeOpacity={0.7}
      >
        <Text style={[styles.questionText, { fontSize: fontSize.small }]}>
          {currentQuestion.text}  <Text style={{ fontSize: fontSize.small }}>🔊</Text>
        </Text>
      </TouchableOpacity>

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