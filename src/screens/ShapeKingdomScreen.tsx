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

// ==================== SHAPE DATA ====================
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

// ==================== LEVELS & QUESTIONS ====================
const LEVELS = [
  {
    name: "Level 1",
    questions: [
      { id: 1, text: "What shape is a round ball?", options: [1,2,3], correct: 1 },
      { id: 2, text: "Which shape has three sides?", options: [1,2,3], correct: 3 },
      { id: 3, text: "A slice of pizza is usually what shape?", options: [1,2,3], correct: 3 },
      { id: 4, text: "What shape has four equal sides?", options: [1,2,3], correct: 2 },
      { id: 5, text: "Which shape has no corners?", options: [1,2,3], correct: 1 },
      { id: 6, text: "An egg is shaped like an…", options: [1,6,2], correct: 6 },
      { id: 7, text: "A starfish looks like a…", options: [4,5,2], correct: 4 },
      { id: 8, text: "Which shape is used for love?", options: [4,5,1], correct: 5 },
      { id: 9, text: "A door is usually a…", options: [2,7,3], correct: 7 },
      { id: 10, text: "A stop sign is what shape?", options: [10,8,2], correct: 10 },
      { id: 11, text: "A coin is what shape?", options: [1,6,2], correct: 1 },
      { id: 12, text: "A yield sign is a…", options: [1,2,3], correct: 3 },
      { id: 13, text: "A chessboard square is a…", options: [1,2,7], correct: 2 },
      { id: 14, text: "A picture frame often looks like a…", options: [2,7,1], correct: 7 },
      { id: 15, text: "The sun in drawings is often a…", options: [1,4,5], correct: 1 },
      { id: 16, text: "A star in the sky is drawn as a…", options: [4,5,1], correct: 4 },
      { id: 17, text: "A heart shape is a symbol for…", options: [4,5,1], correct: 5 },
      { id: 18, text: "A wheel is what shape?", options: [1,6,2], correct: 1 },
      { id: 19, text: "A cracker in the shape of a square is a…", options: [1,2,3], correct: 2 },
      { id: 20, text: "A slice of cheese might be a…", options: [1,2,3], correct: 3 },
    ]
  },
  {
    name: "Level 2",
    questions: [
      { id: 21, text: "Which has more sides, a triangle or a square?", options: [2,3], correct: 2 },
      { id: 22, text: "Which has fewer sides, a square or a pentagon?", options: [2,8], correct: 2 },
      { id: 23, text: "How many corners does a triangle have?", options: [{ id: '3', label: '3' }, { id: '4', label: '4' }, { id: '5', label: '5' }], correct: '3' },
      { id: 24, text: "How many corners does a square have?", options: [{ id: '3', label: '3' }, { id: '4', label: '4' }, { id: '5', label: '5' }], correct: '4' },
      { id: 25, text: "Which shape has the most sides: triangle, square, or circle?", options: [3,2,1], correct: 2 },
      { id: 26, text: "Does a circle have any straight lines?", options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }], correct: 'no' },
      { id: 27, text: "Does a square have any curved lines?", options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }], correct: 'no' },
      { id: 28, text: "Which shape is round: square or circle?", options: [2,1], correct: 1 },
      { id: 29, text: "Which shape has four corners: triangle or square?", options: [3,2], correct: 2 },
      { id: 30, text: "How many sides does a rectangle have?", options: [{ id: '3', label: '3' }, { id: '4', label: '4' }, { id: '5', label: '5' }], correct: '4' },
      { id: 31, text: "Which shape has two long sides and two short sides?", options: [2,7,6], correct: 7 },
      { id: 32, text: "A stop sign has how many sides?", options: [{ id: '6', label: '6' }, { id: '7', label: '7' }, { id: '8', label: '8' }], correct: '8' },
      { id: 33, text: "Which shape has five points?", options: [4,5,3], correct: 4 },
      { id: 34, text: "Which shape has a point at the bottom?", options: [4,5,3], correct: 5 },
      { id: 35, text: "Can a triangle have a curved side?", options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }], correct: 'no' },
      { id: 36, text: "Which shape is like a stretched circle?", options: [1,6], correct: 6 },
      { id: 37, text: "Which shape has four equal sides? (review)", options: [2,7,3], correct: 2 },
      { id: 38, text: "How many sides does a pentagon have?", options: [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }], correct: '5' },
      { id: 39, text: "Which has more corners, a square or a pentagon?", options: [2,8], correct: 8 },
      { id: 40, text: "Which shape is a triangle?", options: [1,2,3], correct: 3 },
    ]
  },
  {
    name: "Level 3",
    questions: [
      { id: 41, text: "What do you call a shape with five sides?", options: [8,9,10], correct: 8 },
      { id: 42, text: "What shape is a honeycomb cell?", options: [9,8,2], correct: 9 },
      { id: 43, text: "A stop sign is an…", options: [8,9,10], correct: 10 },
      { id: 44, text: "Which shape looks like a diamond?", options: [11,2,7], correct: 11 },
      { id: 45, text: "Which shape has one pair of parallel sides?", options: [12,11,7], correct: 12 },
      { id: 46, text: "How many sides does a hexagon have?", options: [{ id: '5', label: '5' }, { id: '6', label: '6' }, { id: '7', label: '7' }], correct: '6' },
      { id: 47, text: "How many corners does an octagon have?", options: [{ id: '6', label: '6' }, { id: '7', label: '7' }, { id: '8', label: '8' }], correct: '8' },
      { id: 48, text: "Which has more sides, a pentagon or a hexagon?", options: [8,9], correct: 9 },
      { id: 49, text: "Which has fewer sides, an octagon or a hexagon?", options: [10,9], correct: 9 },
      { id: 50, text: "A rhombus has how many sides?", options: [{ id: '3', label: '3' }, { id: '4', label: '4' }, { id: '5', label: '5' }], correct: '4' },
      { id: 51, text: "Is a square a type of rhombus?", options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }], correct: 'yes' },
      { id: 52, text: "Which shape has all sides equal but may not have right angles?", options: [11,2,7], correct: 11 },
      { id: 53, text: "Which shape has exactly one pair of parallel sides?", options: [12,11,9], correct: 12 },
      { id: 54, text: "How many sides does a trapezoid have?", options: [{ id: '3', label: '3' }, { id: '4', label: '4' }, { id: '5', label: '5' }], correct: '4' },
      { id: 55, text: "Which of these is NOT a polygon?", options: [1,2,8], correct: 1 },
      { id: 56, text: "Which shape has six sides?", options: [8,9,10], correct: 9 },
      { id: 57, text: "Which shape has eight sides?", options: [8,9,10], correct: 10 },
      { id: 58, text: "Add one side to a pentagon – what do you get?", options: [8,9,10], correct: 9 },
      { id: 59, text: "Subtract one side from a hexagon – what do you get?", options: [8,9,10], correct: 8 },
      { id: 60, text: "Which of these is a quadrilateral?", options: [2,8,10], correct: 2 },
    ]
  },
  {
    name: "Level 4",
    questions: [
      { id: 61, text: "How many lines of symmetry does a square have?", options: [{ id: '2', label: '2' }, { id: '4', label: '4' }, { id: '8', label: '8' }], correct: '4' },
      { id: 62, text: "How many lines of symmetry does a rectangle have?", options: [{ id: '2', label: '2' }, { id: '4', label: '4' }, { id: '0', label: '0' }], correct: '2' },
      { id: 63, text: "How many lines of symmetry does a circle have?", options: [{ id: '1', label: '1' }, { id: '4', label: '4' }, { id: 'unlimited', label: 'Unlimited' }], correct: 'unlimited' },
      { id: 64, text: "How many lines of symmetry does an equilateral triangle have?", options: [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }], correct: '3' },
      { id: 65, text: "Which shape has all sides equal and all angles 90°?", options: [2,11,7], correct: 2 },
      { id: 66, text: "Which shape has opposite sides parallel?", options: [2,3,1], correct: 2 },
      { id: 67, text: "A cube is a 3D shape. What 2D shape is on each face?", options: [2,7,3], correct: 2 },
      { id: 68, text: "A sphere is a 3D shape like a ball. What 2D shape is it related to?", options: [1,6,2], correct: 1 },
      { id: 69, text: "A cylinder has two ends that are what shape?", options: [1,2,6], correct: 1 },
      { id: 70, text: "A cone has a base that is a…", options: [1,2,3], correct: 1 },
      { id: 71, text: "How many faces does a cube have?", options: [{ id: '4', label: '4' }, { id: '6', label: '6' }, { id: '8', label: '8' }], correct: '6' },
      { id: 72, text: "How many edges does a cube have?", options: [{ id: '8', label: '8' }, { id: '12', label: '12' }, { id: '6', label: '6' }], correct: '12' },
      { id: 73, text: "How many vertices (corners) does a cube have?", options: [{ id: '6', label: '6' }, { id: '8', label: '8' }, { id: '12', label: '12' }], correct: '8' },
      { id: 74, text: "Which 3D shape is like a can?", options: [{ id: 'cylinder', label: 'Cylinder' }, { id: 'sphere', label: 'Sphere' }, { id: 'cone', label: 'Cone' }], correct: 'cylinder' },
      { id: 75, text: "Which 3D shape is like an ice cream cone?", options: [{ id: 'cylinder', label: 'Cylinder' }, { id: 'sphere', label: 'Sphere' }, { id: 'cone', label: 'Cone' }], correct: 'cone' },
      { id: 76, text: "Which 3D shape is like a ball?", options: [{ id: 'cylinder', label: 'Cylinder' }, { id: 'sphere', label: 'Sphere' }, { id: 'cube', label: 'Cube' }], correct: 'sphere' },
      { id: 77, text: "A pyramid has a base that can be a square. What shape are the other faces?", options: [3,2,1], correct: 3 },
      { id: 78, text: "How many sides does a pentagon have? (review)", options: [{ id: '5', label: '5' }, { id: '6', label: '6' }, { id: '4', label: '4' }], correct: '5' },
      { id: 79, text: "How many sides does a hexagon have? (review)", options: [{ id: '5', label: '5' }, { id: '6', label: '6' }, { id: '7', label: '7' }], correct: '6' },
      { id: 80, text: "How many sides does an octagon have? (review)", options: [{ id: '6', label: '6' }, { id: '7', label: '7' }, { id: '8', label: '8' }], correct: '8' },
    ]
  },
  {
    name: "Level 5",
    questions: [
      { id: 81, text: "What do you call a shape with 10 sides?", options: [{ id: 'decagon', label: 'Decagon' }, { id: 'nonagon', label: 'Nonagon' }, { id: 'octagon', label: 'Octagon' }], correct: 'decagon' },
      { id: 82, text: "What do you call a shape with 9 sides?", options: [{ id: 'decagon', label: 'Decagon' }, { id: 'nonagon', label: 'Nonagon' }, { id: 'heptagon', label: 'Heptagon' }], correct: 'nonagon' },
      { id: 83, text: "What do you call a shape with 7 sides?", options: [{ id: 'hexagon', label: 'Hexagon' }, { id: 'heptagon', label: 'Heptagon' }, { id: 'octagon', label: 'Octagon' }], correct: 'heptagon' },
      { id: 84, text: "Which quadrilateral has all sides equal but angles not 90°?", options: [11,2,7], correct: 11 },
      { id: 85, text: "Which quadrilateral has only one pair of parallel sides?", options: [12,11,2], correct: 12 },
      { id: 86, text: "Which shape has two pairs of parallel sides and all angles 90°?", options: [2,7,11], correct: 7 },
      { id: 87, text: "If you cut a square along a diagonal, how many triangles do you get?", options: [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '4', label: '4' }], correct: '2' },
      { id: 88, text: "If you cut a rectangle along both diagonals, how many triangles?", options: [{ id: '2', label: '2' }, { id: '4', label: '4' }, { id: '6', label: '6' }], correct: '4' },
      { id: 89, text: "What is the name of a 3D shape with six square faces?", options: [{ id: 'cube', label: 'Cube' }, { id: 'cuboid', label: 'Cuboid' }, { id: 'pyramid', label: 'Pyramid' }], correct: 'cube' },
      { id: 90, text: "What is the name of a 3D shape with two circular faces and a curved surface?", options: [{ id: 'cylinder', label: 'Cylinder' }, { id: 'cone', label: 'Cone' }, { id: 'sphere', label: 'Sphere' }], correct: 'cylinder' },
      { id: 91, text: "What is the name of a 3D shape with one circular face and a point?", options: [{ id: 'cylinder', label: 'Cylinder' }, { id: 'cone', label: 'Cone' }, { id: 'pyramid', label: 'Pyramid' }], correct: 'cone' },
      { id: 92, text: "How many edges does a square‑based pyramid have?", options: [{ id: '6', label: '6' }, { id: '8', label: '8' }, { id: '10', label: '10' }], correct: '8' },
      { id: 93, text: "How many faces does a square‑based pyramid have?", options: [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }], correct: '5' },
      { id: 94, text: "How many vertices does a square‑based pyramid have?", options: [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }], correct: '5' },
      { id: 95, text: "Which shape has the most sides: pentagon, hexagon, or octagon?", options: [8,9,10], correct: 10 },
      { id: 96, text: "Which shape has the fewest sides: triangle, square, or pentagon?", options: [3,2,8], correct: 3 },
      { id: 97, text: "How many degrees are in a right angle?", options: [{ id: '45', label: '45°' }, { id: '90', label: '90°' }, { id: '180', label: '180°' }], correct: '90' },
      { id: 98, text: "How many right angles does a square have?", options: [{ id: '2', label: '2' }, { id: '4', label: '4' }, { id: '0', label: '0' }], correct: '4' },
      { id: 99, text: "How many right angles does a right triangle have?", options: [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }], correct: '1' },
      { id: 100, text: "How many acute angles does an equilateral triangle have?", options: [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }], correct: '3' },
    ]
  },
  {
    name: "Level 6",
    questions: [
      { id: 101, text: "How many different nets does a cube have?", options: [{ id: '6', label: '6' }, { id: '11', label: '11' }, { id: '8', label: '8' }], correct: '11' },
      { id: 102, text: "What shape is the cross‑section of a cylinder cut vertically?", options: [1,2,7], correct: 7 },
      { id: 103, text: "What shape is the cross‑section of a cylinder cut horizontally?", options: [1,2,6], correct: 1 },
      { id: 104, text: "What shape is the cross‑section of a cone cut vertically?", options: [3,1,2], correct: 3 },
      { id: 105, text: "What shape is the cross‑section of a sphere?", options: [1,6,2], correct: 1 },
      { id: 106, text: "How many lines of symmetry does a regular pentagon have?", options: [{ id: '5', label: '5' }, { id: '4', label: '4' }, { id: '6', label: '6' }], correct: '5' },
      { id: 107, text: "How many lines of symmetry does a regular hexagon have?", options: [{ id: '6', label: '6' }, { id: '5', label: '5' }, { id: '7', label: '7' }], correct: '6' },
      { id: 108, text: "Which shape has rotational symmetry of order 4?", options: [2,3,1], correct: 2 },
      { id: 109, text: "Which shape has rotational symmetry of order 3?", options: [3,2,1], correct: 3 },
      { id: 110, text: "What is the sum of interior angles of a triangle?", options: [{ id: '90', label: '90°' }, { id: '180', label: '180°' }, { id: '360', label: '360°' }], correct: '180' },
      { id: 111, text: "What is the sum of interior angles of a quadrilateral?", options: [{ id: '180', label: '180°' }, { id: '360', label: '360°' }, { id: '540', label: '540°' }], correct: '360' },
      { id: 112, text: "What is the sum of interior angles of a pentagon?", options: [{ id: '360', label: '360°' }, { id: '540', label: '540°' }, { id: '720', label: '720°' }], correct: '540' },
      { id: 113, text: "A rectangle has length 5 and width 3. What is its perimeter?", options: [{ id: '15', label: '15' }, { id: '16', label: '16' }, { id: '8', label: '8' }], correct: '16' },
      { id: 114, text: "A square has side 4. What is its area?", options: [{ id: '8', label: '8' }, { id: '16', label: '16' }, { id: '12', label: '12' }], correct: '16' },
      { id: 115, text: "How many edges does a triangular prism have?", options: [{ id: '6', label: '6' }, { id: '9', label: '9' }, { id: '12', label: '12' }], correct: '9' },
      { id: 116, text: "How many faces does a triangular prism have?", options: [{ id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' }], correct: '5' },
      { id: 117, text: "How many vertices does a triangular prism have?", options: [{ id: '4', label: '4' }, { id: '6', label: '6' }, { id: '8', label: '8' }], correct: '6' },
      { id: 118, text: "Which 3D shape has no edges or vertices?", options: [{ id: 'sphere', label: 'Sphere' }, { id: 'cylinder', label: 'Cylinder' }, { id: 'cone', label: 'Cone' }], correct: 'sphere' },
      { id: 119, text: "A shape has 4 sides, all equal, but no right angles. What is it?", options: [11,2,12], correct: 11 },
      { id: 120, text: "A shape has 4 sides, only one pair of parallel sides. What is it?", options: [12,11,7], correct: 12 },
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
export default function ShapeKingdomScreen() {
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

  // Generate a new extra option (shape ID) not in current set and not the correct answer
  const generateExtraOption = (currentOpts, correctAns) => {
    // Only works for number options (shape IDs)
    const usedIds = currentOpts.map(opt => typeof opt === 'number' ? opt : null).filter(id => id !== null);
    const possibleIds = SHAPES.map(s => s.id).filter(id => id !== correctAns && !usedIds.includes(id));
    if (possibleIds.length === 0) return null; // no more shapes to add
    const randomIndex = Math.floor(Math.random() * possibleIds.length);
    return possibleIds[randomIndex];
  };

  // Update options after a wrong attempt
  const updateOptionsAfterWrong = () => {
    if (!currentQuestion) return;
    const baseOpts = currentQuestion.options;
    // Only expand if options are all numbers (shape IDs)
    const allNumbers = baseOpts.every(opt => typeof opt === 'number');
    if (!allNumbers) {
      // For text options, just shuffle
      setCurrentOptions(shuffleArray(baseOpts));
      return;
    }

    // We can add one extra shape (if available)
    const newExtra = generateExtraOption(currentOptions, currentQuestion.correct);
    if (newExtra) {
      const newOpts = [...currentOptions, newExtra];
      setCurrentOptions(shuffleArray(newOpts));
    } else {
      // No new shape to add, just shuffle
      setCurrentOptions(shuffleArray(currentOptions));
    }
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
      const saved = await AsyncStorage.getItem('shapeKingdom_highScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {}
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await AsyncStorage.setItem('shapeKingdom_highScore', newScore.toString());
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
      // Not yet 3 wrongs – add extra option and shuffle
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
        // Not yet 3 wrongs – add extra option and shuffle
        updateOptionsAfterWrong();
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
          <Text style={[styles.loadingEmoji, { fontSize: fontSize.xlarge * 2 }]}>🔴🟦🔺</Text>
        </Animated.View>
        <Text style={[styles.loadingText, { fontSize: fontSize.large }]}>Loading Shape Kingdom...</Text>
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
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🏰 Shape Kingdom</Text>
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
              isShape ? { width: shapeSize, height: shapeSize } : { minWidth: width * 0.2, paddingHorizontal: 15, paddingVertical: 10 },
              isSelected && styles.optionSelected,
              questionResolved && styles.optionDisabled,
            ]}
          >
            {isShape ? (
              <View style={[styles.shapeCircle, { 
                backgroundColor: shape.color,
                width: shapeSize,
                height: shapeSize,
                borderRadius: shapeSize / 2,
              }]}>
                <Text style={[styles.shapeEmoji, { fontSize: shapeSize * 0.5 }]}>{shape.emoji}</Text>
              </View>
            ) : (
              <View style={[styles.textOption, { backgroundColor: COLORS.surface }]}>
                <Text style={[styles.optionText, { fontSize: fontSize.medium }]}>{opt.label}</Text>
              </View>
            )}
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