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
  Alert,
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
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFD166',
  purple: '#9D79BC',
  pink: '#FF8BA0',
  teal: '#06D6A0',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  success: '#00B894',
  error: '#FF7675',
  gold: '#FDCB6E',
  shadow: '#000000',
};

// ==================== SHAPE DATA ====================
const SHAPES = [
  { id: 1, name: "Circle", color: COLORS.primary, emoji: "🔴", description: "round like a ball" },
  { id: 2, name: "Square", color: COLORS.secondary, emoji: "🟦", description: "four equal sides" },
  { id: 3, name: "Triangle", color: COLORS.accent, emoji: "🔺", description: "three sides" },
  { id: 4, name: "Star", color: COLORS.purple, emoji: "⭐", description: "shining in the sky" },
  { id: 5, name: "Heart", color: COLORS.pink, emoji: "❤️", description: "love shape" },
  { id: 6, name: "Diamond", color: COLORS.teal, emoji: "💎", description: "sparkly gem" },
  { id: 7, name: "Pentagon", color: '#A3E4D7', emoji: "⬟", description: "five sides" },
  { id: 8, name: "Hexagon", color: '#F9D56E', emoji: "⬡", description: "six sides, like a honeycomb" },
];

// ==================== DIFFICULTY LEVELS ====================
const DIFFICULTIES = {
  easy: {
    name: "Easy",
    levels: [
      { targetIds: [1], options: [1,2,3], timeLimit: 30, points: 10 },
      { targetIds: [2], options: [1,2,4], timeLimit: 25, points: 15 },
      { targetIds: [3], options: [2,3,5], timeLimit: 25, points: 15 },
    ],
  },
  medium: {
    name: "Medium",
    levels: [
      { targetIds: [4], options: [3,4,5,6], timeLimit: 20, points: 20 },
      { targetIds: [5], options: [4,5,6,7], timeLimit: 18, points: 20 },
      { targetIds: [6], options: [5,6,7,8], timeLimit: 15, points: 25 },
      { targetIds: [7], options: [1,3,5,7,8], timeLimit: 15, points: 30 },
    ],
  },
  hard: {
    name: "Hard",
    levels: [
      { targetIds: [8], options: [2,4,6,8], timeLimit: 12, points: 30 },
      { targetIds: [1,2], options: [1,2,3,4,5], timeLimit: 10, points: 35 },
      { targetIds: [3,4], options: [2,3,4,5,6], timeLimit: 10, points: 35 },
      { targetIds: [5,6], options: [4,5,6,7,8], timeLimit: 8, points: 40 },
      { targetIds: [7,8], options: [1,3,5,7,8], timeLimit: 8, points: 50 },
    ],
  },
};

// ==================== SOUND MANAGER ====================
class SoundManager {
  static sounds = {};

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
        console.log(`Failed to load sound: ${key}`);
      }
    }
  }

  static async play(key) {
    try {
      if (this.sounds[key]) {
        await this.sounds[key].replayAsync();
      }
    } catch (e) {
      console.log(`Failed to play sound: ${key}`);
    }
  }

  static async setVolume(volume) {
    for (const sound of Object.values(this.sounds)) {
      await sound.setVolumeAsync(volume);
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
  const [difficulty, setDifficulty] = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [combo, setCombo] = useState(0);
  const [levelUpMessage, setLevelUpMessage] = useState(null);
  
  // Stats for final scoreboard
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(null);
  
  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef(null);
  
  // Timer Ref
  const timerRef = useRef(null);

  // Responsive sizes
  const shapeSize = Math.min(width * 0.2, height * 0.1);
  const targetSize = width * 0.25;
  const fontSize = {
    small: width * 0.03,
    medium: width * 0.04,
    large: width * 0.06,
    xlarge: width * 0.08,
  };

  // ==================== MEMOIZED VALUES ====================
  const currentLevels = useMemo(() => difficulty ? DIFFICULTIES[difficulty].levels : [], [difficulty]);
  const currentLevel = useMemo(() => currentLevels[currentLevelIndex] || null, [currentLevels, currentLevelIndex]);
  
  const targetShapes = useMemo(() => 
    SHAPES.filter(s => currentLevel?.targetIds.includes(s.id)),
    [currentLevel]
  );
  
  const availableShapes = useMemo(() => 
    SHAPES.filter(s => currentLevel?.options.includes(s.id)),
    [currentLevel]
  );

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    initializeGame();
    loadHighScore();
    SoundManager.loadSounds();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      startTimer();
      animateEntrance();
      setLevelStartTime(Date.now());
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentLevelIndex, gameState]);

  useEffect(() => {
    console.log('gameState:', gameState, 'difficulty:', difficulty, 'levelIndex:', currentLevelIndex);
  }, [gameState, difficulty, currentLevelIndex]);

  // ==================== GAME FUNCTIONS ====================
  const initializeGame = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGameState("difficultySelect");
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
    setTimeLeft(currentLevel?.timeLimit || 30);
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
    if (timerRef.current) clearInterval(timerRef.current);
    showFeedback("timeout", "⏰ Time's up!");
    HapticManager.error();
    if (!isMuted) SoundManager.play('error');
    setStreak(0);
    setCombo(0);
    setTotalAttempts(prev => prev + 1);
  };

  const animateEntrance = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setFeedback(null));
  };

  const showLevelUpMessage = (message) => {
    setLevelUpMessage(message);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setLevelUpMessage(null));
  };

  const handleShapeSelect = useCallback((shapeId) => {
    if (gameState !== "playing") return;
    setSelectedShapeId(shapeId);
    HapticManager.light();
    if (!isMuted) SoundManager.play('click');
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [gameState, isMuted]);

  const handleCheckAnswer = useCallback(() => {
    if (gameState !== "playing" || !selectedShapeId) {
      showFeedback("warning", "👆 Select a shape first!");
      HapticManager.error();
      if (!isMuted) SoundManager.play('error');
      return;
    }

    const isCorrect = currentLevel.targetIds.includes(selectedShapeId);
    const timeSpent = levelStartTime ? (Date.now() - levelStartTime) / 1000 : 0;
    setTotalTimeSpent(prev => prev + timeSpent);
    setTotalAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setTotalCorrect(prev => prev + 1);
      
      const timeBonus = Math.max(0, Math.floor((timeLeft / currentLevel.timeLimit) * 10));
      const pointsEarned = currentLevel.points + (combo * 5) + timeBonus;
      setScore(prev => {
        const newScore = prev + pointsEarned;
        saveHighScore(newScore);
        return newScore;
      });
      setStreak(prev => prev + 1);
      setCombo(prev => prev + 1);
      
      HapticManager.success();
      if (!isMuted) SoundManager.play('success');
      showFeedback("success", `🎉 +${pointsEarned} points!`);
      
      if (confettiRef.current) confettiRef.current.play();
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (currentLevelIndex === currentLevels.length - 1) {
        setTimeout(() => {
          setGameState("completed");
          if (!isMuted) SoundManager.play('gameComplete');
        }, 1200);
      } else {
        setTimeout(() => {
          setCurrentLevelIndex(prev => prev + 1);
          setSelectedShapeId(null);
          showLevelUpMessage(`Level ${currentLevelIndex + 2}`);
        }, 1200);
      }
    } else {
      const wrongShape = SHAPES.find(s => s.id === selectedShapeId);
      showFeedback("error", `❌ That's a ${wrongShape?.name}!`);
      HapticManager.error();
      if (!isMuted) SoundManager.play('error');
      setStreak(0);
      setCombo(0);
      
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [gameState, selectedShapeId, currentLevel, currentLevelIndex, combo, timeLeft, isMuted, levelStartTime, currentLevels.length]);

  const handleHint = useCallback(() => {
    if (!currentLevel) return;
    const hintText = targetShapes.map(s => s.description).join(' or ');
    setShowHint(true);
    HapticManager.medium();
    if (!isMuted) SoundManager.play('click');
    setTimeout(() => setShowHint(false), 3000);
  }, [targetShapes, isMuted]);

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff);
    setCurrentLevelIndex(0);
    setScore(0);
    setStreak(0);
    setCombo(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setTotalTimeSpent(0);
    setSelectedShapeId(null);
    setGameState("playing");
    HapticManager.success();
  };

  const handleRestartSameDifficulty = () => {
    setCurrentLevelIndex(0);
    setScore(0);
    setStreak(0);
    setCombo(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setTotalTimeSpent(0);
    setSelectedShapeId(null);
    setGameState("playing");
  };

  const handleChangeDifficulty = () => {
    setGameState("difficultySelect");
    setDifficulty(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    SoundManager.setVolume(isMuted ? 0.5 : 0);
  };

  // ==================== RENDER FUNCTIONS ====================
  if (gameState === "loading") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
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

  if (gameState === "difficultySelect") {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <Text style={[styles.welcomeTitle, { fontSize: fontSize.xlarge }]}>🏰 Shape Kingdom</Text>
        <Text style={[styles.welcomeSubtitle, { fontSize: fontSize.medium }]}>Choose your challenge!</Text>
        
        <View style={styles.difficultyContainer}>
          {Object.keys(DIFFICULTIES).map(diff => (
            <TouchableOpacity
              key={diff}
              style={[styles.difficultyButton, { backgroundColor: diff === 'easy' ? COLORS.success : diff === 'medium' ? COLORS.accent : COLORS.error }]}
              onPress={() => handleDifficultySelect(diff)}
            >
              <Text style={[styles.difficultyButtonText, { fontSize: fontSize.large }]}>{DIFFICULTIES[diff].name}</Text>
              <Text style={[styles.difficultyLevels, { fontSize: fontSize.small }]}>{DIFFICULTIES[diff].levels.length} levels</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setSettingsVisible(true)}
        >
          <Text style={[styles.settingsText, { fontSize: fontSize.large }]}>⚙️</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (gameState === "completed") {
    if (!difficulty) {
      return (
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <Text>Error: Difficulty not set</Text>
          <TouchableOpacity onPress={() => setGameState("difficultySelect")}>
            <Text>Back to Menu</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const avgTime = totalAttempts > 0 ? (totalTimeSpent / totalAttempts).toFixed(1) : 0;
    const isNewRecord = score > highScore;

    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <LottieView
          ref={confettiRef}
          source={require('../../assets/animations/confetti.json')}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
        
        <Text style={[styles.completeTitle, { fontSize: fontSize.xlarge }]}>🎉 Game Complete! 🎉</Text>
        <Text style={[styles.completeSubtitle, { fontSize: fontSize.medium }]}>You finished {DIFFICULTIES[difficulty]?.name} mode!</Text>
        
        <View style={[styles.resultCard, { padding: width * 0.05 }]}>
          <Text style={[styles.resultScore, { fontSize: fontSize.large }]}>Total Score: {score}</Text>
          {isNewRecord && <Text style={[styles.newRecord, { fontSize: fontSize.medium }]}>🏆 NEW RECORD! 🏆</Text>}
          <Text style={[styles.resultStat, { fontSize: fontSize.small }]}>Accuracy: {accuracy}%</Text>
          <Text style={[styles.resultStat, { fontSize: fontSize.small }]}>Avg Time: {avgTime}s</Text>
          <Text style={[styles.resultStat, { fontSize: fontSize.small }]}>Best Streak: {streak}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playAgainButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={handleRestartSameDifficulty}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.changeDiffButton, { paddingHorizontal: width * 0.05, paddingVertical: height * 0.015 }]}
            onPress={handleChangeDifficulty}
          >
            <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Change Difficulty</Text>
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

  if (!currentLevel) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text>Loading level...</Text>
      </SafeAreaView>
    );
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.1, 0, 0.1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.header, { height: height * 0.08 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { fontSize: fontSize.large }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.levelText, { fontSize: fontSize.small }]}>Level {currentLevelIndex + 1}/{currentLevels.length}</Text>
          <Text style={[styles.levelName, { fontSize: fontSize.medium }]}>{DIFFICULTIES[difficulty]?.name} Mode</Text>
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
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>🔥</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{streak}</Text>
        </View>
        
        <View style={[styles.statBadge, timeLeft < 10 && styles.statBadgeWarning]}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>⏰</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>{timeLeft}s</Text>
        </View>
        
        <View style={styles.statBadge}>
          <Text style={[styles.statBadgeIcon, { fontSize: fontSize.medium }]}>⚡</Text>
          <Text style={[styles.statBadgeText, { fontSize: fontSize.small }]}>x{combo}</Text>
        </View>
      </View>

      <View style={[styles.targetSection, { height: height * 0.15 }]}>
        <Text style={[styles.targetLabel, { fontSize: fontSize.small }]}>Find the shape:</Text>
        <View style={styles.targetShapes}>
          {targetShapes.map(shape => (
            <Animated.View
              key={shape.id}
              style={[
                styles.targetShapeWrapper,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <View style={[styles.targetShape, { 
                backgroundColor: shape.color,
                width: targetSize,
                height: targetSize,
                borderRadius: targetSize / 2,
              }]}>
                <Text style={[styles.targetEmoji, { fontSize: targetSize * 0.5 }]}>{shape.emoji}</Text>
                <Text style={[styles.targetName, { fontSize: fontSize.small }]}>{shape.name}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {levelUpMessage && (
        <Animated.View style={[styles.levelUpOverlay, { opacity: fadeAnim }]}>
          <Text style={[styles.levelUpText, { fontSize: fontSize.large }]}>{levelUpMessage}</Text>
        </Animated.View>
      )}

      {showHint && (
        <Animated.View style={[styles.hintOverlay, { opacity: fadeAnim }]}>
          <Text style={[styles.hintText, { fontSize: fontSize.medium, padding: width * 0.02 }]}>
            {targetShapes.map(s => s.description).join(' or ')}
          </Text>
        </Animated.View>
      )}

      {feedback && (
        <Animated.View style={[styles.feedbackOverlay, { opacity: fadeAnim }]}>
          <Text style={[
            styles.feedbackText,
            { fontSize: fontSize.large },
            feedback.type === 'success' && styles.feedbackSuccess,
            feedback.type === 'error' && styles.feedbackError,
            feedback.type === 'timeout' && styles.feedbackWarning,
          ]}>
            {feedback.message}
          </Text>
        </Animated.View>
      )}

      <ScrollView 
        contentContainerStyle={styles.shapesGridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shapesGrid}>
          {availableShapes.map((shape) => (
            <Animated.View
              key={shape.id}
              style={{
                transform: [
                  { scale: selectedShapeId === shape.id ? scaleAnim : 1 },
                  { rotate: rotateInterpolate }
                ]
              }}
            >
              <TouchableOpacity
                onPress={() => handleShapeSelect(shape.id)}
                activeOpacity={0.7}
                style={[
                  styles.shapeTouch,
                  { width: shapeSize, height: shapeSize },
                  selectedShapeId === shape.id && styles.shapeSelected
                ]}
              >
                <View style={[styles.shapeCircle, { 
                  backgroundColor: shape.color,
                  width: shapeSize,
                  height: shapeSize,
                  borderRadius: shapeSize / 2,
                }]}>
                  <Text style={[styles.shapeEmoji, { fontSize: shapeSize * 0.5 }]}>{shape.emoji}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.controls, { height: height * 0.08 }]}>
        <TouchableOpacity
          style={[styles.controlButton, styles.checkButton, { paddingVertical: height * 0.015 }]}
          onPress={handleCheckAnswer}
          activeOpacity={0.8}
        >
          <Text style={[styles.controlButtonText, { fontSize: fontSize.medium }]}>✓ Check</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.hintButton, { paddingVertical: height * 0.015 }]}
          onPress={handleHint}
          activeOpacity={0.8}
        >
          <Text style={[styles.controlButtonText, { fontSize: fontSize.medium }]}>? Hint</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.progressContainer, { height: height * 0.03 }]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentLevelIndex + 1) / currentLevels.length) * 100}%` }
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
  
  difficultyContainer: {
    width: '80%',
    marginVertical: 20,
  },
  difficultyButton: {
    padding: 20,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 5,
  },
  difficultyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  difficultyLevels: {
    color: 'white',
    marginTop: 5,
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
  
  targetSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetLabel: {
    color: COLORS.textLight,
    marginBottom: 4,
  },
  targetShapes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  targetShapeWrapper: {
    alignItems: 'center',
  },
  targetShape: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  targetEmoji: {},
  targetName: {
    fontWeight: '600',
    color: 'white',
    marginTop: 4,
  },
  
  levelUpOverlay: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  levelUpText: {
    backgroundColor: COLORS.secondary + 'CC',
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
    overflow: 'hidden',
  },
  
  shapesGridContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  shapeTouch: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  shapeSelected: {
    transform: [{ scale: 1.1 }],
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  shapeEmoji: {},
  
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 10,
  },
  controlButton: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  checkButton: {
    backgroundColor: COLORS.success,
  },
  hintButton: {
    backgroundColor: COLORS.accent,
  },
  controlButtonText: {
    color: 'white',
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
    zIndex: 10,
  },
  feedbackText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
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
  
  hintOverlay: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  hintText: {
    backgroundColor: COLORS.accent + 'CC',
    color: 'white',
    fontWeight: '600',
    borderRadius: 50,
    overflow: 'hidden',
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
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
  },
  changeDiffButton: {
    backgroundColor: COLORS.accent,
  },
  homeButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 30,
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
    color: 'white',
    fontWeight: '600',
  },
});