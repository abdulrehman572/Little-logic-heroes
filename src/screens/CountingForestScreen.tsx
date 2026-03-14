import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import ErrorBoundary from '../components/ErrorBoundary';

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

const QUESTION_TIME = 15; // seconds per question
const POINTS_CORRECT = 2;
const POINTS_WRONG_PENALTY = 2;

// ==================== TYPES ====================
type QuestionType =
  | 'count'
  | 'compare'
  | 'match-number'
  | 'fact'
  | 'sequence'
  | 'pattern'
  | 'addition'
  | 'subtraction'
  | 'word-problem';

interface Question {
  id: number;
  type: QuestionType;
  prompt: string;
  emojiSet?: string;
  setA?: string;
  setB?: string;
  compareTarget?: 'more' | 'less' | 'equal';
  correctSet?: 'A' | 'B' | 'equal';
  numeral?: number;
  options?: (number | string)[];
  correctAnswer: number | string;
}

// ==================== NEW LEVEL DATA (120 QUESTIONS) ====================
const level1Questions: Question[] = [
  { id: 1, type: 'count', prompt: 'Count the trees', emojiSet: '🌳', correctAnswer: 1 },
  { id: 2, type: 'count', prompt: 'Count the birds', emojiSet: '🐦🐦', correctAnswer: 2 },
  { id: 3, type: 'count', prompt: 'Count the suns', emojiSet: '☀️', correctAnswer: 1 },
  { id: 4, type: 'count', prompt: 'Count the apples', emojiSet: '🍎🍎🍎', correctAnswer: 3 },
  { id: 5, type: 'count', prompt: 'Count the squirrels', emojiSet: '🐿️', correctAnswer: 1 },
  { id: 6, type: 'compare', prompt: 'Which has more?', setA: '🌳🌳', setB: '🐦🐦🐦', compareTarget: 'more', correctSet: 'B', correctAnswer: 'B' },
  { id: 7, type: 'compare', prompt: 'Which has fewer?', setA: '☀️☀️☀️', setB: '🍎🍎', compareTarget: 'less', correctSet: 'B', correctAnswer: 'B' },
  // Replaced "Are they equal?" with a new "more" question using caterpillars
  { id: 8, type: 'compare', prompt: 'Which has more?', setA: '🐛🐛', setB: '🐛🐛🐛', compareTarget: 'more', correctSet: 'B', correctAnswer: 'B' },
  { id: 9, type: 'match-number', prompt: 'Find the set with 2 trees', numeral: 2, options: [1,2,3], correctAnswer: 2 },
  { id: 10, type: 'match-number', prompt: 'Find the set with 3 birds', numeral: 3, options: [2,3,4], correctAnswer: 3 },
  { id: 11, type: 'fact', prompt: 'How many legs does a cat have?', options: [2,4,6], correctAnswer: 4 },
  { id: 12, type: 'fact', prompt: 'How many wheels on a bicycle?', options: [1,2,3], correctAnswer: 2 },
  { id: 13, type: 'sequence', prompt: 'What number is missing? 1, 2, _, 4', options: [2,3,5], correctAnswer: 3 },
  { id: 14, type: 'sequence', prompt: 'What number is missing? 3, 4, 5, _', options: [5,6,7], correctAnswer: 6 },
  { id: 15, type: 'pattern', prompt: 'Complete: 🌳, 🌳, 🐦, 🌳, 🌳, ?', options: ['🌳','🐦','☀️'], correctAnswer: '🐦' },
  { id: 16, type: 'pattern', prompt: 'Complete: ☀️, ☁️, ☀️, ☁️, ?', options: ['☀️','☁️','🌧️'], correctAnswer: '☀️' },
  { id: 17, type: 'addition', prompt: '2 + 1 = ?', options: [2,3,4], correctAnswer: 3 },
  { id: 18, type: 'subtraction', prompt: '3 - 1 = ?', options: [1,2,3], correctAnswer: 2 },
  { id: 19, type: 'word-problem', prompt: 'You have 2 apples. You find 1 more. How many now?', options: [2,3,4], correctAnswer: 3 },
  { id: 20, type: 'word-problem', prompt: 'There are 4 birds. 1 flies away. How many left?', options: [2,3,4], correctAnswer: 3 },
];

const level2Questions: Question[] = [
  { id: 1, type: 'count', prompt: 'Count the acorns', emojiSet: '🌰🌰🌰🌰', correctAnswer: 4 },
  { id: 2, type: 'count', prompt: 'Count the mushrooms', emojiSet: '🍄🍄🍄🍄🍄', correctAnswer: 5 },
  { id: 3, type: 'count', prompt: 'Count the stars', emojiSet: '⭐⭐⭐⭐⭐⭐', correctAnswer: 6 },
  { id: 4, type: 'count', prompt: 'Count the leaves', emojiSet: '🍃🍃🍃🍃🍃🍃🍃', correctAnswer: 7 },
  { id: 5, type: 'count', prompt: 'Count the flowers', emojiSet: '🌼🌼🌼🌼🌼🌼🌼🌼', correctAnswer: 8 },
  { id: 6, type: 'compare', prompt: 'Which has more?', setA: '🌰🌰🌰🌰🌰', setB: '🍄🍄🍄🍄', compareTarget: 'more', correctSet: 'A', correctAnswer: 'A' },
  { id: 7, type: 'compare', prompt: 'Which has fewer?', setA: '⭐⭐⭐⭐⭐⭐', setB: '⭐⭐⭐⭐⭐', compareTarget: 'less', correctSet: 'B', correctAnswer: 'B' },
  // Replaced "Are they equal?" with a new "fewer" question using bees
  { id: 8, type: 'compare', prompt: 'Which has fewer?', setA: '🐝🐝🐝', setB: '🐝🐝', compareTarget: 'less', correctSet: 'B', correctAnswer: 'B' },
  { id: 9, type: 'match-number', prompt: 'Find the set with 6 acorns', numeral: 6, options: [5,6,7], correctAnswer: 6 },
  { id: 10, type: 'match-number', prompt: 'Find the set with 4 mushrooms', numeral: 4, options: [3,4,5], correctAnswer: 4 },
  { id: 11, type: 'fact', prompt: 'How many legs does a spider have?', options: [6,8,10], correctAnswer: 8 },
  { id: 12, type: 'fact', prompt: 'How many days in a week?', options: [5,7,10], correctAnswer: 7 },
  { id: 13, type: 'sequence', prompt: 'Fill in: 2, 4, 6, _', options: [7,8,9], correctAnswer: 8 },
  { id: 14, type: 'sequence', prompt: 'Fill in: 5, 6, 7, _, 9', options: [6,8,10], correctAnswer: 8 },
  { id: 15, type: 'pattern', prompt: 'Complete: 🌰, 🍄, 🌰, 🍄, ?', options: ['🌰','🍄','⭐'], correctAnswer: '🌰' },
  { id: 16, type: 'pattern', prompt: 'Complete: ⭐, ⭐, 🌼, ⭐, ⭐, ?', options: ['⭐','🌼','🍄'], correctAnswer: '🌼' },
  { id: 17, type: 'addition', prompt: '3 + 4 = ?', options: [6,7,8], correctAnswer: 7 },
  { id: 18, type: 'subtraction', prompt: '8 - 3 = ?', options: [4,5,6], correctAnswer: 5 },
  { id: 19, type: 'word-problem', prompt: 'Sam has 5 apples. He buys 2 more. How many now?', options: [6,7,8], correctAnswer: 7 },
  { id: 20, type: 'word-problem', prompt: 'There are 9 candies. You eat 3. How many left?', options: [5,6,7], correctAnswer: 6 },
];

const level3Questions: Question[] = [
  { id: 1, type: 'count', prompt: 'Count the acorns', emojiSet: '🌰'.repeat(11), correctAnswer: 11 },
  { id: 2, type: 'count', prompt: 'Count the mushrooms', emojiSet: '🍄'.repeat(12), correctAnswer: 12 },
  { id: 3, type: 'count', prompt: 'Count the stars', emojiSet: '⭐'.repeat(15), correctAnswer: 15 },
  { id: 4, type: 'count', prompt: 'Count the leaves', emojiSet: '🍃'.repeat(14), correctAnswer: 14 },
  { id: 5, type: 'count', prompt: 'Count the flowers', emojiSet: '🌼'.repeat(13), correctAnswer: 13 },
  { id: 6, type: 'fact', prompt: 'Which number is bigger? 15 or 12?', options: [12,15], correctAnswer: 15 },
  { id: 7, type: 'fact', prompt: 'Which number is smaller? 18 or 20?', options: [18,20], correctAnswer: 18 },
  { id: 8, type: 'fact', prompt: 'Which number is the same as 14?', options: [13,14,15], correctAnswer: 14 },
  { id: 9, type: 'addition', prompt: '7 + 8 = ?', options: [14,15,16], correctAnswer: 15 },
  { id: 10, type: 'subtraction', prompt: '15 - 6 = ?', options: [8,9,10], correctAnswer: 9 },
  { id: 11, type: 'sequence', prompt: 'Fill in: 10, 12, 14, _', options: [15,16,17], correctAnswer: 16 },
  { id: 12, type: 'sequence', prompt: 'Fill in: 5, 10, 15, _', options: [18,20,25], correctAnswer: 20 },
  { id: 13, type: 'pattern', prompt: 'Complete pattern: 2, 4, 6, 8, ?', options: [9,10,12], correctAnswer: 10 },
  { id: 14, type: 'pattern', prompt: 'Complete: 5, 10, 15, ?', options: [18,20,25], correctAnswer: 20 },
  { id: 15, type: 'word-problem', prompt: 'There are 12 birds. 5 fly away. How many left?', options: [6,7,8], correctAnswer: 7 },
  { id: 16, type: 'word-problem', prompt: 'You have 8 stickers. Your friend gives you 7 more. How many now?', options: [14,15,16], correctAnswer: 15 },
  { id: 17, type: 'fact', prompt: 'How many months in a year?', options: [10,12,14], correctAnswer: 12 },
  { id: 18, type: 'fact', prompt: 'How many hours in a day?', options: [12,24,36], correctAnswer: 24 },
  { id: 19, type: 'addition', prompt: '9 + 9 = ?', options: [16,18,20], correctAnswer: 18 },
  { id: 20, type: 'subtraction', prompt: '20 - 7 = ?', options: [12,13,14], correctAnswer: 13 },
];

const level4Questions: Question[] = [
  { id: 1, type: 'count', prompt: 'Count the acorns', emojiSet: '🌰'.repeat(23), correctAnswer: 23 },
  { id: 2, type: 'count', prompt: 'Count the mushrooms', emojiSet: '🍄'.repeat(27), correctAnswer: 27 },
  { id: 3, type: 'count', prompt: 'Count the stars', emojiSet: '⭐'.repeat(31), correctAnswer: 31 },
  { id: 4, type: 'count', prompt: 'Count the leaves', emojiSet: '🍃'.repeat(29), correctAnswer: 29 },
  { id: 5, type: 'count', prompt: 'Count the flowers', emojiSet: '🌼'.repeat(35), correctAnswer: 35 },
  { id: 6, type: 'fact', prompt: 'Which number is bigger? 42 or 38?', options: [38,42], correctAnswer: 42 },
  { id: 7, type: 'fact', prompt: 'Which number is smaller? 27 or 29?', options: [27,29], correctAnswer: 27 },
  { id: 8, type: 'fact', prompt: 'Which number is equal to 33?', options: [32,33,34], correctAnswer: 33 },
  { id: 9, type: 'addition', prompt: '18 + 15 = ?', options: [32,33,34], correctAnswer: 33 },
  { id: 10, type: 'subtraction', prompt: '42 - 17 = ?', options: [24,25,26], correctAnswer: 25 },
  { id: 11, type: 'sequence', prompt: 'Fill in: 20, 25, 30, _', options: [32,35,40], correctAnswer: 35 },
  { id: 12, type: 'sequence', prompt: 'Fill in: 33, 36, 39, _', options: [40,41,42], correctAnswer: 42 },
  { id: 13, type: 'pattern', prompt: 'Skip count by 5: 5, 10, 15, 20, ?', options: [22,25,30], correctAnswer: 25 },
  { id: 14, type: 'pattern', prompt: 'Skip count by 10: 10, 20, 30, 40, ?', options: [45,50,60], correctAnswer: 50 },
  { id: 15, type: 'word-problem', prompt: 'There are 25 children in a class. 12 are boys. How many girls?', options: [11,12,13], correctAnswer: 13 },
  { id: 16, type: 'word-problem', prompt: 'You have 36 crayons. You lose 8. How many left?', options: [26,28,30], correctAnswer: 28 },
  { id: 17, type: 'fact', prompt: 'How many seconds in a minute?', options: [30,60,100], correctAnswer: 60 },
  { id: 18, type: 'fact', prompt: 'How many centimeters in a meter?', options: [10,100,1000], correctAnswer: 100 },
  { id: 19, type: 'addition', prompt: '24 + 19 = ?', options: [41,42,43], correctAnswer: 43 },
  { id: 20, type: 'subtraction', prompt: '50 - 23 = ?', options: [26,27,28], correctAnswer: 27 },
];

const level5Questions: Question[] = [
  { id: 1, type: 'count', prompt: 'Count the acorns', emojiSet: '🌰'.repeat(47), correctAnswer: 47 },
  { id: 2, type: 'count', prompt: 'Count the mushrooms', emojiSet: '🍄'.repeat(53), correctAnswer: 53 },
  { id: 3, type: 'count', prompt: 'Count the stars', emojiSet: '⭐'.repeat(68), correctAnswer: 68 },
  { id: 4, type: 'count', prompt: 'Count the leaves', emojiSet: '🍃'.repeat(72), correctAnswer: 72 },
  { id: 5, type: 'count', prompt: 'Count the flowers', emojiSet: '🌼'.repeat(84), correctAnswer: 84 },
  { id: 6, type: 'fact', prompt: 'Which number is bigger? 75 or 79?', options: [75,79], correctAnswer: 79 },
  { id: 7, type: 'fact', prompt: 'Which number is smaller? 62 or 58?', options: [58,62], correctAnswer: 58 },
  { id: 8, type: 'fact', prompt: 'Which number is equal to 81?', options: [80,81,82], correctAnswer: 81 },
  { id: 9, type: 'addition', prompt: '37 + 46 = ?', options: [81,82,83], correctAnswer: 83 },
  { id: 10, type: 'subtraction', prompt: '94 - 38 = ?', options: [54,55,56], correctAnswer: 56 },
  { id: 11, type: 'sequence', prompt: 'Fill in: 45, 50, 55, _', options: [58,60,65], correctAnswer: 60 },
  { id: 12, type: 'sequence', prompt: 'Fill in: 22, 24, 26, 28, _', options: [29,30,32], correctAnswer: 30 },
  { id: 13, type: 'pattern', prompt: 'Skip count by 3: 3, 6, 9, 12, ?', options: [13,15,18], correctAnswer: 15 },
  { id: 14, type: 'pattern', prompt: 'Skip count by 5: 55, 60, 65, 70, ?', options: [72,75,80], correctAnswer: 75 },
  { id: 15, type: 'word-problem', prompt: 'A book has 98 pages. You read 34. How many left?', options: [62,64,66], correctAnswer: 64 },
  { id: 16, type: 'word-problem', prompt: 'There are 56 apples in a basket. You add 27 more. How many now?', options: [81,82,83], correctAnswer: 83 },
  { id: 17, type: 'fact', prompt: 'How many minutes in an hour?', options: [30,60,90], correctAnswer: 60 },
  { id: 18, type: 'fact', prompt: 'How many hours in a day?', options: [12,24,36], correctAnswer: 24 },
  { id: 19, type: 'addition', prompt: '48 + 47 = ?', options: [93,94,95], correctAnswer: 95 },
  { id: 20, type: 'subtraction', prompt: '100 - 63 = ?', options: [35,36,37], correctAnswer: 37 },
];

const level6Questions: Question[] = [
  { id: 1, type: 'count', prompt: 'Count the acorns', emojiSet: '🌰'.repeat(97), correctAnswer: 97 },
  { id: 2, type: 'count', prompt: 'Count the mushrooms', emojiSet: '🍄'.repeat(86), correctAnswer: 86 },
  { id: 3, type: 'count', prompt: 'Count the stars', emojiSet: '⭐'.repeat(75), correctAnswer: 75 },
  { id: 4, type: 'count', prompt: 'Count the leaves', emojiSet: '🍃'.repeat(64), correctAnswer: 64 },
  { id: 5, type: 'count', prompt: 'Count the flowers', emojiSet: '🌼'.repeat(53), correctAnswer: 53 },
  { id: 6, type: 'fact', prompt: 'Which number is bigger? 89 or 93?', options: [89,93], correctAnswer: 93 },
  { id: 7, type: 'fact', prompt: 'Which number is smaller? 77 or 72?', options: [72,77], correctAnswer: 72 },
  { id: 8, type: 'fact', prompt: 'Which number is equal to 100?', options: [99,100,101], correctAnswer: 100 },
  { id: 9, type: 'addition', prompt: '49 + 48 = ?', options: [95,96,97], correctAnswer: 97 },
  { id: 10, type: 'subtraction', prompt: '82 - 37 = ?', options: [43,44,45], correctAnswer: 45 },
  { id: 11, type: 'sequence', prompt: 'Fill in: 12, 17, 22, 27, _', options: [30,32,37], correctAnswer: 32 },
  { id: 12, type: 'sequence', prompt: 'Fill in: 90, 80, 70, 60, _', options: [40,50,55], correctAnswer: 50 },
  { id: 13, type: 'pattern', prompt: 'What comes next? 1, 4, 9, 16, ? (squares)', options: [20,25,36], correctAnswer: 25 },
  { id: 14, type: 'pattern', prompt: 'Skip count by 3: 3, 6, 9, 12, ?', options: [13,14,15], correctAnswer: 15 },
  { id: 15, type: 'word-problem', prompt: 'There are 45 red marbles and 38 blue marbles. How many total?', options: [81,82,83], correctAnswer: 83 },
  { id: 16, type: 'word-problem', prompt: 'You have 70 candies. You give 25 to your friend. How many left?', options: [35,45,55], correctAnswer: 45 },
  { id: 17, type: 'fact', prompt: 'How many days in a leap year?', options: [365,366,367], correctAnswer: 366 },
  { id: 18, type: 'fact', prompt: 'How many weeks in a year?', options: [48,50,52], correctAnswer: 52 },
  { id: 19, type: 'addition', prompt: '67 + 28 = ?', options: [93,94,95], correctAnswer: 95 },
  { id: 20, type: 'subtraction', prompt: '100 - 49 = ?', options: [49,50,51], correctAnswer: 51 },
];

const forestLevels = [
  level1Questions,
  level2Questions,
  level3Questions,
  level4Questions,
  level5Questions,
  level6Questions,
];

// ==================== SOUND MANAGER ====================
class SoundManager {
  static sounds = {};
  static loaded = false;
  static loadingPromise = null;

  static async loadSounds() {
    if (this.loadingPromise) return this.loadingPromise;
    console.log('🎵 SoundManager: Loading sounds...');

    const soundFiles = {
      success: require('../../assets/sounds/success.mp3'),
      error: require('../../assets/sounds/error.mp3'),
      click: require('../../assets/sounds/click.mp3'),
      levelUp: require('../../assets/sounds/levelup.mp3'),
      gameComplete: require('../../assets/sounds/complete.mp3'),
    };

    this.loadingPromise = Promise.all(
      Object.entries(soundFiles).map(async ([key, file]) => {
        try {
          console.log(`   Loading ${key}...`);
          const { sound } = await Audio.Sound.createAsync(
            file,
            { volume: 1.0, shouldPlay: false }
          );
          this.sounds[key] = sound;
          console.log(`   ✅ ${key} loaded`);
        } catch (e) {
          console.error(`   ❌ ${key} failed:`, e);
        }
      })
    );

    await this.loadingPromise;
    this.loaded = true;
    console.log('🎵 SoundManager: All sounds loaded');
  }

  static async play(key) {
    if (!this.loaded) {
      console.warn(`⚠️ SoundManager: Not loaded yet, waiting...`);
      await this.loadSounds();
    }

    const sound = this.sounds[key];
    if (!sound) {
      console.error(`❌ SoundManager: No sound found for key "${key}"`);
      return;
    }

    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      await sound.playAsync();
      console.log(`🔊 Playing: ${key}`);
    } catch (e) {
      console.error(`❌ Error playing ${key}:`, e);
    }
  }

  static async setVolume(volume) {
    for (const sound of Object.values(this.sounds)) {
      try {
        await sound.setVolumeAsync(volume);
      } catch (e) {
        console.warn('Failed to set volume:', e);
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

// ==================== EMOJI DISPLAY ====================
const EmojiDisplay = ({ emojiString, size = 40 }: { emojiString: string; size?: number }) => {
  const emojis = Array.from(emojiString);
  return (
    <View style={styles.emojiRow}>
      {emojis.map((emoji, index) => (
        <Text key={index} style={{ fontSize: size, marginHorizontal: 2 }}>{emoji}</Text>
      ))}
    </View>
  );
};

// ==================== HELPER: GENERATE ADDITIONAL OPTIONS ====================
const generateAdditionalOptions = (
  question: Question,
  currentOptions: (number | string)[],
  targetCount: number
): (number | string)[] => {
  const correct = question.correctAnswer;
  const type = question.type;
  let newOptions = [...currentOptions];

  if (!newOptions.includes(correct)) {
    newOptions.push(correct);
  }

  if (typeof correct === 'number') {
    while (newOptions.length < targetCount) {
      let candidate: number;
      if (type === 'fact' || type === 'sequence' || type === 'addition' || type === 'subtraction' || type === 'word-problem' || type === 'match-number') {
        const range = 10;
        const min = Math.max(0, correct - range);
        const max = correct + range;
        candidate = Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        candidate = Math.floor(Math.random() * 20) + 1;
      }
      if (!newOptions.includes(candidate) && candidate !== correct) {
        newOptions.push(candidate);
      }
    }
  }
  else if (typeof correct === 'string') {
    const emojiPool = ['🌰','🍄','⭐','🌼','🍃','🐌','🦋','🐞','🍎','🫐'];
    while (newOptions.length < targetCount) {
      const candidate = emojiPool[Math.floor(Math.random() * emojiPool.length)];
      if (!newOptions.includes(candidate)) {
        newOptions.push(candidate);
      }
    }
  }

  return newOptions.sort(() => Math.random() - 0.5);
};

// ==================== QUESTION RENDERER ====================
interface QuestionRendererProps {
  question: Question;
  options?: (number | string)[];
  onAnswer: (isCorrect: boolean) => void;
  onTap?: () => void;
  disabled?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  options,
  onAnswer,
  onTap,
  disabled
}) => {
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [countedItems, setCountedItems] = useState<boolean[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (question.type === 'count' && question.emojiSet) {
      setCountedItems(new Array(question.emojiSet.length).fill(false));
      setCount(0);
    }
  }, [question]);

  const handleItemPress = (index: number) => {
    if (disabled) return;
    if (question.type === 'count' && !countedItems[index]) {
      const newCounted = [...countedItems];
      newCounted[index] = true;
      setCountedItems(newCounted);
      setCount(prev => prev + 1);
      onTap?.();
    }
  };

  const handleOptionSelect = (opt: number | string) => {
    if (disabled) return;
    setSelectedOption(opt);
    const correct = opt === question.correctAnswer;
    onAnswer(correct);
  };

  const handleCompareSelect = (set: 'A' | 'B') => {
    if (disabled) return;
    const correct = set === question.correctSet;
    onAnswer(correct);
  };

  const handleCountSubmit = (num: number) => {
    if (disabled) return;
    const correct = num === question.correctAnswer;
    onAnswer(correct);
  };

  const renderMatchNumber = () => {
    const target = question.numeral!;
    const displayOptions = options && options.length ? options : question.options;
    const numericOptions = displayOptions as number[];
    return (
      <View>
        <Text style={styles.promptText}>Find the set with {target} acorns</Text>
        <View style={styles.setsContainer}>
          {numericOptions.map((count, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.setButton}
              onPress={() => handleOptionSelect(count)}
              disabled={disabled}
            >
              <EmojiDisplay emojiString={'🌰'.repeat(count)} size={30} />
              <Text style={styles.setCount}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderCount = () => {
    if (!question.emojiSet) return null;
    const emojis = Array.from(question.emojiSet);
    return (
      <View>
        <Text style={styles.promptText}>{question.prompt}</Text>
        <View style={styles.itemsGrid}>
          {emojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.emojiItem, countedItems[index] && styles.itemCounted]}
              onPress={() => handleItemPress(index)}
              disabled={disabled}
            >
              <Text style={{ fontSize: 40 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.countDisplay}>Counted: {count}</Text>
        <View style={styles.numerals}>
          {[count, count+1, count-1].filter(n => n>0 && n<=emojis.length+2).map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numeralButton}
              onPress={() => handleCountSubmit(num)}
              disabled={disabled}
            >
              <Text style={styles.numeralText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderCompare = () => {
    return (
      <View>
        <Text style={styles.promptText}>{question.prompt}</Text>
        <View style={styles.compareContainer}>
          <TouchableOpacity style={styles.compareSet} onPress={() => handleCompareSelect('A')} disabled={disabled}>
            <Text style={styles.setLabel}>A</Text>
            <EmojiDisplay emojiString={question.setA!} size={40} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compareSet} onPress={() => handleCompareSelect('B')} disabled={disabled}>
            <Text style={styles.setLabel}>B</Text>
            <EmojiDisplay emojiString={question.setB!} size={40} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFactOrSequence = () => {
    const displayOptions = options && options.length ? options : question.options;
    return (
      <View>
        <Text style={styles.promptText}>{question.prompt}</Text>
        <View style={styles.numerals}>
          {displayOptions?.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.numeralButton, selectedOption === opt && styles.numeralButtonSelected]}
              onPress={() => handleOptionSelect(opt)}
              disabled={disabled}
            >
              <Text style={styles.numeralText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPattern = () => {
    const displayOptions = options && options.length ? options : question.options;
    return (
      <View>
        <Text style={styles.promptText}>{question.prompt}</Text>
        <View style={styles.numerals}>
          {displayOptions?.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.numeralButton, selectedOption === opt && styles.numeralButtonSelected]}
              onPress={() => handleOptionSelect(opt)}
              disabled={disabled}
            >
              <Text style={styles.emojiOption}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  switch (question.type) {
    case 'count': return renderCount();
    case 'compare': return renderCompare();
    case 'match-number': return renderMatchNumber();
    case 'fact': case 'sequence': case 'addition': case 'subtraction': case 'word-problem': return renderFactOrSequence();
    case 'pattern': return renderPattern();
    default: return null;
  }
};

// ==================== MAIN SCREEN ====================
function CountingForestScreenContent({ navigation }: any) {
  const { width, height } = useWindowDimensions();

  const [gameState, setGameState] = useState("loading");
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScoreAccumulated, setTotalScoreAccumulated] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<(number | string)[] | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerExpiredRef = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef(null);

  const currentLevel = forestLevels[levelIndex];
  const currentQuestion = currentLevel?.[questionIndex];
  const totalQuestionsInLevel = currentLevel?.length || 0;
  const totalLevels = forestLevels.length;
  const totalQuestionsAll = forestLevels.reduce((acc, level) => acc + level.length, 0);
  const totalPossibleAll = totalQuestionsAll * POINTS_CORRECT;

  useEffect(() => {
    initializeGame();
    loadHighScore();
    loadSounds();
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      animateEntrance();
      if (currentQuestion) {
        if (currentQuestion.options) {
          setCurrentOptions([...currentQuestion.options]);
        } else {
          setCurrentOptions(null);
        }
      }
    }
  }, [questionIndex, levelIndex, gameState]);

  useEffect(() => {
    if (gameState !== "playing" || questionResolved) return;

    setTimeLeft(QUESTION_TIME);
    timerExpiredRef.current = false;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!questionResolved && !timerExpiredRef.current) {
            timerExpiredRef.current = true;
            handleAnswer(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [questionIndex, levelIndex, gameState, questionResolved]);

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
      const saved = await AsyncStorage.getItem('forest_highScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {}
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem('forest_highScore', newScore.toString());
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

  const advanceToNextQuestion = () => {
    if (questionIndex + 1 < totalQuestionsInLevel) {
      setQuestionIndex(prev => prev + 1);
      setAttempts(0);
      setQuestionResolved(false);
    } else {
      setTotalScoreAccumulated(prev => prev + score);
      setGameState("completed");
      if (!isMuted && soundsLoaded) SoundManager.play('levelUp');
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (questionResolved) return;

    if (isCorrect) {
      const newScore = score + POINTS_CORRECT;
      setScore(newScore);
      saveHighScore(newScore);
      showFeedback("success", `🎉 +${POINTS_CORRECT} marks!`);
      HapticManager.success();
      if (!isMuted && soundsLoaded) SoundManager.play('success');
      if (confettiRef.current) confettiRef.current.play();
      setQuestionResolved(true);
      setTimeout(() => advanceToNextQuestion(), 1000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      showFeedback("error", "❌ Try again!");
      HapticManager.error();
      if (!isMuted && soundsLoaded) SoundManager.play('error');

      if (newAttempts >= 3) {
        const newScore = Math.max(0, score - POINTS_WRONG_PENALTY);
        setScore(newScore);
        showFeedback("error", `❌ -${POINTS_WRONG_PENALTY} marks`);
        setQuestionResolved(true);
        setTimeout(() => advanceToNextQuestion(), 1000);
      } else {
        if (currentQuestion && currentOptions && currentQuestion.options) {
          const targetCount = 3 + newAttempts;
          const newOpts = generateAdditionalOptions(currentQuestion, currentOptions, targetCount);
          setCurrentOptions(newOpts);
        }
      }
    }
  };

  const handleLevelSelect = (index) => {
    setLevelIndex(index);
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setQuestionResolved(false);
    setGameState("playing");
    HapticManager.success();
  };

  const handleRestartSameLevel = () => {
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setQuestionResolved(false);
    setGameState("playing");
  };

  const handleChangeLevel = () => {
    setGameState("levelSelect");
    setLevelIndex(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    SoundManager.setVolume(isMuted ? 0.5 : 0);
  };

  // ==================== TEST BUTTON (TEMPORARY) ====================
  const testSound = async () => {
    console.log('🔊 Test button pressed');
    await SoundManager.play('success');
  };

  const fontSize = {
    small: width * 0.035,
    medium: width * 0.045,
    large: width * 0.055,
    xlarge: width * 0.07,
  };

  if (gameState === "loading") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={[styles.loadingEmoji, { fontSize: fontSize.xlarge * 2 }]}>🌲🐿️</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: fontSize.large }]}>Loading Counting Forest...</Text>
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
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🌳 Counting Forest</Text>
        <Text style={[styles.welcomeSubtitle, { fontSize: fontSize.medium }]}>Choose a level</Text>

        <ScrollView contentContainerStyle={styles.levelContainer} showsVerticalScrollIndicator={false}>
          {forestLevels.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.levelButton}
              onPress={() => handleLevelSelect(idx)}
            >
              <Text style={[styles.levelButtonText, { fontSize: fontSize.large }]}>Level {idx + 1}</Text>
              <Text style={[styles.levelQuestions, { fontSize: fontSize.small }]}>{forestLevels[idx].length} questions</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Settings button removed */}
      </SafeAreaView>
    );
  }

  if (gameState === "completed") {
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
          <Text style={[styles.resultScore, { fontSize: fontSize.large }]}>Marks: {score} / {totalQuestionsInLevel * POINTS_CORRECT}</Text>
          {isNewRecord && <Text style={[styles.newRecord, { fontSize: fontSize.medium }]}>🏆 NEW RECORD! 🏆</Text>}
          <Text style={[styles.resultStat, { fontSize: fontSize.small }]}>Total Marks: {totalScoreAccumulated} / {totalPossibleAll}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.playAgainButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]} onPress={handleRestartSameLevel}>
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.changeDiffButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]} onPress={handleChangeLevel}>
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Change Level</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.homeButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Temporary test button – red, top‑right corner */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          right: 20,
          zIndex: 999,
          backgroundColor: 'red',
          padding: 10,
          borderRadius: 20,
        }}
        onPress={testSound}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Test Sound</Text>
      </TouchableOpacity>

      <View style={[styles.header, { height: height * 0.08 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { fontSize: fontSize.large }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.levelText, { fontSize: fontSize.small }]}>L{levelIndex+1}/{totalLevels} Q{questionIndex+1}/{totalQuestionsInLevel}</Text>
          <Text style={[styles.levelName, { fontSize: fontSize.small }]}>Level {levelIndex+1}</Text>
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
        <View style={styles.statBadge}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>❓</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{attempts}/3</Text>
        </View>
        <View style={styles.statBadge}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>⏳</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{timeLeft}s</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        {currentQuestion && (
          <QuestionRenderer
            question={currentQuestion}
            options={currentOptions || undefined}
            onAnswer={handleAnswer}
            onTap={() => {}}
            disabled={questionResolved}
          />
        )}
      </ScrollView>

      {feedback && (
        <Animated.View style={[styles.feedbackOverlay, { opacity: fadeAnim }]}>
          <Text style={[
            styles.feedbackText,
            { fontSize: fontSize.large },
            feedback.type === 'success' && styles.feedbackSuccess,
            feedback.type === 'error' && styles.feedbackError,
          ]}>
            {feedback.message}
          </Text>
        </Animated.View>
      )}

      <View style={[styles.progressContainer, { height: height * 0.03 }]}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((questionIndex + 1) / totalQuestionsInLevel) * 100}%` }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function CountingForestScreen(props: any) {
  return (
    <ErrorBoundary>
      <CountingForestScreenContent {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerCenter: { alignItems: 'center' },
  levelText: { color: COLORS.textLight },
  levelName: { fontWeight: '600', color: COLORS.text },
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
  statBadgeWarning: { backgroundColor: COLORS.error + '20' },
  statBadgeIcon: { marginRight: 4 },
  statBadgeText: { fontWeight: '600', color: COLORS.text },
  questionSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  questionText: { color: COLORS.text, fontWeight: '400', textAlign: 'center', lineHeight: 22 },
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
  optionsGridContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 10 },
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
  checkButton: { backgroundColor: COLORS.success },
  controlButtonText: { color: COLORS.text, fontWeight: 'bold' },
  progressContainer: { paddingHorizontal: 20, marginBottom: 10 },
  progressBar: { height: 8, backgroundColor: COLORS.surface, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.secondary, borderRadius: 4 },
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
  feedbackSuccess: { color: COLORS.success },
  feedbackError: { color: COLORS.error },
  feedbackWarning: { color: COLORS.accent },
  confetti: { position: 'absolute', width: '100%', height: '100%' },
  completeTitle: { fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 8 },
  completeSubtitle: { color: COLORS.textLight, marginBottom: 30 },
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
  resultScore: { fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  newRecord: { color: COLORS.gold, fontWeight: 'bold', marginBottom: 8 },
  resultStat: { color: COLORS.textLight, marginTop: 4 },
  buttonRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
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
  playAgainButton: { backgroundColor: COLORS.primary },
  nextLevelButton: { backgroundColor: COLORS.accent },
  homeButton: { backgroundColor: COLORS.secondary },
  changeDiffButton: { backgroundColor: COLORS.accent },
  actionButtonText: { color: COLORS.text, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 30, alignItems: 'center', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  modalTitle: { fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.background, width: '100%', alignItems: 'center' },
  modalOptionText: { color: COLORS.text },
  modalButton: { borderRadius: 25, alignItems: 'center', marginTop: 10, width: '100%' },
  modalCloseButton: { backgroundColor: COLORS.secondary },
  modalButtonText: { color: COLORS.text, fontWeight: '600' },
  // Extra styles for CountingForest
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  emojiItem: { padding: 10, margin: 5, backgroundColor: COLORS.surface, borderRadius: 10 },
  itemCounted: { opacity: 0.3 },
  countDisplay: { fontSize: 18, textAlign: 'center', marginVertical: 10 },
  numerals: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  numeralButton: { backgroundColor: COLORS.surface, padding: 15, margin: 5, borderRadius: 10, minWidth: 50, alignItems: 'center' },
  numeralButtonSelected: { backgroundColor: COLORS.accent },
  numeralText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  promptText: { fontSize: 22, textAlign: 'center', marginVertical: 15, color: COLORS.text },
  setsContainer: { flexDirection: 'row', justifyContent: 'center' },
  setButton: { alignItems: 'center', margin: 10, padding: 10, backgroundColor: COLORS.surface, borderRadius: 15 },
  setCount: { fontSize: 16, marginTop: 5 },
  compareContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  compareSet: { alignItems: 'center', margin: 10 },
  setLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  emojiOption: { fontSize: 30 },
  mainContent: { flexGrow: 1, padding: 20, alignItems: 'center' },
});