// src/screens/LogicLandScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Modal,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBoundary from '../components/ErrorBoundary';

const { width: screenWidth } = Dimensions.get('window');

// ==================== Audio (optional) ====================
let Audio: any;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  Audio = null;
}

// ==================== Types & Constants ====================
const ACTIVITIES = {
  SIZE_SORT: 1,
  CATEGORY_SORT: 2,
  LOGICAL_ORDER: 3,
  ODD_ONE_OUT: 4,
  MAZE_PATH: 5,
} as const;

type ActivityId = typeof ACTIVITIES[keyof typeof ACTIVITIES];

// ==================== Audio Manager ====================
const AudioManager = {
  sounds: {} as Record<string, any>,

  async loadSounds() {
    if (!Audio || Platform.OS === 'web') return;
    const soundFiles = {
      count: require('../assets/sounds/count.mp3'),
      success: require('../assets/sounds/success.mp3'),
      gentleError: require('../assets/sounds/gentle_error.mp3'),
    };
    for (const [key, source] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source);
        this.sounds[key] = sound;
      } catch (e) {}
    }
  },

  async playSound(key: string) {
    if (!Audio || Platform.OS === 'web' || !this.sounds[key]) return;
    try {
      await this.sounds[key].replayAsync();
    } catch (error) {}
  },
};

// ==================== Adaptive Difficulty Hook ====================
const useAdaptiveDifficulty = (moduleKey: string) => {
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const loadLevel = async () => {
      try {
        const stored = await AsyncStorage.getItem(`difficulty_${moduleKey}`);
        if (stored) setLevel(parseInt(stored));
      } catch (error) {}
    };
    loadLevel();
  }, []);

  const adjustDifficulty = (isCorrect: boolean, responseTime: number) => {};

  return { level, adjustDifficulty };
};

// ==================== Activity 1: Size Sorting ====================
const SizeSort = ({ level, onItemTap, onComplete }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const sizes = [
      { width: 40, height: 40, label: 'small' },
      { width: 60, height: 60, label: 'medium' },
      { width: 80, height: 80, label: 'large' },
    ];
    const newItems = sizes.map((size, idx) => ({
      id: `size-${idx}`,
      emoji: '🐶',
      size,
    }));
    setItems(newItems.sort(() => 0.5 - Math.random()));
    setSelectedIndex(null);
    startTime.current = Date.now();
  }, [level]);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    const correct = items[index].size.width === 40;
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    onComplete(correct, responseTime);
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Tap the smallest item</Text>
      <View style={styles.sortRow}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.sortItem,
              {
                width: item.size.width,
                height: item.size.height,
                backgroundColor: '#FFB74D',
                borderRadius: 15,
              },
              selectedIndex === idx && styles.selectedItem,
            ]}
            onPress={() => handlePress(idx)}
          >
            <Text style={[styles.sortEmoji, { fontSize: item.size.width * 0.8 }]}>
              {item.emoji}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 2: Category Sorting ====================
const CategorySort = ({ level, onItemTap, onComplete }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const allItems = [
      { id: 'cat', emoji: '🐱', category: 'animals' },
      { id: 'dog', emoji: '🐶', category: 'animals' },
      { id: 'apple', emoji: '🍎', category: 'fruits' },
      { id: 'banana', emoji: '🍌', category: 'fruits' },
      { id: 'car', emoji: '🚗', category: 'vehicles' },
      { id: 'plane', emoji: '✈️', category: 'vehicles' },
    ];
    const shuffled = allItems.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setItems(selected);
    setCategories(['animals', 'fruits', 'vehicles']);
    setSelectedCategory(null);
    startTime.current = Date.now();
  }, [level]);

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    const correct = category === items[0]?.category;
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    onComplete(correct, responseTime);
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Where does this belong?</Text>
      <View style={styles.questionItem}>
        <Text style={styles.questionEmoji}>{items[0]?.emoji}</Text>
      </View>
      <View style={styles.categoriesRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && styles.categorySelected]}
            onPress={() => handleCategoryPress(cat)}
          >
            <Text style={styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 3: Logical Order ====================
const LogicalOrder = ({ level, onItemTap, onComplete }: any) => {
  const [cards, setCards] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const story = [
      { id: 1, text: '🌱 Plant seed', order: 1 },
      { id: 2, text: '💧 Water daily', order: 2 },
      { id: 3, text: '🌸 Flower blooms', order: 3 },
    ];
    const shuffled = [...story].sort(() => 0.5 - Math.random());
    setCards(shuffled);
    setSelectedOrder([]);
    startTime.current = Date.now();
  }, [level]);

  const handleCardPress = (cardId: number) => {
    if (selectedOrder.includes(cardId)) {
      setSelectedOrder(selectedOrder.filter(id => id !== cardId));
    } else {
      const newOrder = [...selectedOrder, cardId];
      setSelectedOrder(newOrder);
      if (newOrder.length === 3) {
        const correct = newOrder[0] === 1 && newOrder[1] === 2 && newOrder[2] === 3;
        const responseTime = Date.now() - startTime.current;
        onItemTap();
        onComplete(correct, responseTime);
      }
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Tap in the correct order (first → next → last)</Text>
      <View style={styles.cardsRow}>
        {cards.map(card => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, selectedOrder.includes(card.id) && styles.cardSelected]}
            onPress={() => handleCardPress(card.id)}
          >
            <Text style={styles.cardText}>{card.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 4: Odd One Out ====================
const OddOneOut = ({ level, onItemTap, onComplete }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const all = [
      { id: 1, emoji: '🐶', category: 'animal' },
      { id: 2, emoji: '🐱', category: 'animal' },
      { id: 3, emoji: '🐭', category: 'animal' },
      { id: 4, emoji: '🍎', category: 'fruit' },
    ];
    setItems(all.sort(() => 0.5 - Math.random()));
    setSelected(null);
    startTime.current = Date.now();
  }, [level]);

  const handleSelect = (index: number) => {
    setSelected(index);
    const correct = items[index].category !== 'animal';
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    onComplete(correct, responseTime);
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Which one is the odd one out?</Text>
      <View style={styles.oddRow}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.oddItem, selected === idx && styles.oddSelected]}
            onPress={() => handleSelect(idx)}
          >
            <Text style={styles.oddEmoji}>{item.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 5: Maze Path ====================
const MazePath = ({ level, onItemTap, onComplete }: any) => {
  const [isComplete, setIsComplete] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const startTime = useRef(Date.now());

  const characterRef = useRef<View>(null);
  const targetRef = useRef<View>(null);
  const characterLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const targetLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    startTime.current = Date.now();
    setIsComplete(false);
    pan.setValue({ x: 0, y: 0 });
  }, [level]);

  const measureCharacter = () => {
    if (characterRef.current) {
      characterRef.current.measure((x, y, width, height, pageX, pageY) => {
        characterLayout.current = { x: pageX, y: pageY, width, height };
      });
    }
  };

  const measureTarget = () => {
    if (targetRef.current) {
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        targetLayout.current = { x: pageX, y: pageY, width, height };
      });
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isComplete,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      const charX = characterLayout.current.x + gesture.dx;
      const charY = characterLayout.current.y + gesture.dy;
      const target = targetLayout.current;

      const isInside =
        charX >= target.x &&
        charX <= target.x + target.width &&
        charY >= target.y &&
        charY <= target.y + target.height;

      if (isInside) {
        const targetOffsetX = target.x - characterLayout.current.x;
        const targetOffsetY = target.y - characterLayout.current.y;
        Animated.spring(pan, {
          toValue: { x: targetOffsetX, y: targetOffsetY },
          friction: 5,
          useNativeDriver: false,
        }).start(() => {
          setIsComplete(true);
          onItemTap();
          onComplete(true, Date.now() - startTime.current);
        });
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Drag the character to the star</Text>
      <View style={styles.mazeContainer}>
        <View
          ref={targetRef}
          style={styles.target}
          onLayout={measureTarget}
          collapsable={false}
        >
          <Text style={styles.targetEmoji}>⭐</Text>
        </View>
        <Animated.View
          ref={characterRef}
          style={[
            styles.character,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
          onLayout={measureCharacter}
          collapsable={false}
        >
          <Text style={styles.characterEmoji}>🐭</Text>
        </Animated.View>
        <View style={[styles.wall, { top: 50, left: 30, width: 10, height: 150 }]} />
        <View style={[styles.wall, { top: 50, right: 30, width: 10, height: 150 }]} />
      </View>
    </View>
  );
};

// ==================== Main Screen Component ====================
function LogicLandScreenContent({ navigation }: any) {
  const [currentActivity, setCurrentActivity] = useState<ActivityId>(ACTIVITIES.SIZE_SORT);
  const [completedActivities, setCompletedActivities] = useState<Record<ActivityId, boolean>>({} as any);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [completionVisible, setCompletionVisible] = useState(false);
  const { level, adjustDifficulty } = useAdaptiveDifficulty('logicLand');
  const messageTimeout = useRef<NodeJS.Timeout | null>(null);
  const hintTimeout = useRef<NodeJS.Timeout | null>(null);

  const getHint = (activity: ActivityId): string => {
    switch (activity) {
      case ACTIVITIES.SIZE_SORT:
        return "Look at the sizes – which one is tiny?";
      case ACTIVITIES.CATEGORY_SORT:
        return "Think about groups: animals, fruits, or vehicles?";
      case ACTIVITIES.LOGICAL_ORDER:
        return "What happens first, next, and last?";
      case ACTIVITIES.ODD_ONE_OUT:
        return "Three belong together, one is different.";
      case ACTIVITIES.MAZE_PATH:
        return "Guide the mouse to the star!";
      default:
        return "Think carefully!";
    }
  };

  useEffect(() => {
    AudioManager.loadSounds();
  }, []);

  const showTemporaryMessage = (text: string, type: 'success' | 'error') => {
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    setMessage({ text, type });
    messageTimeout.current = setTimeout(() => {
      setMessage(null);
    }, 1500);
  };

  const showHint = () => {
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    setHintMessage(getHint(currentActivity));
    hintTimeout.current = setTimeout(() => {
      setHintMessage(null);
    }, 2000);
  };

  const handleActivityComplete = (success: boolean, responseTime: number) => {
    adjustDifficulty(success, responseTime);
    if (success) {
      AudioManager.playSound('success');
      setScore(prev => prev + 1);
      showTemporaryMessage('Great job!', 'success');
      setCompletedActivities(prev => ({
        ...prev,
        [currentActivity]: true,
      }));
      if (currentActivity < ACTIVITIES.MAZE_PATH) {
        setTimeout(() => setCurrentActivity((currentActivity + 1) as ActivityId), 1500);
      } else {
        setTimeout(() => setCompletionVisible(true), 1500);
      }
    } else {
      AudioManager.playSound('gentleError');
      showTemporaryMessage('Try again!', 'error');
    }
  };

  const handlePlayAgain = () => {
    setCurrentActivity(ACTIVITIES.SIZE_SORT);
    setCompletedActivities({});
    setScore(0);
    setCompletionVisible(false);
  };

  const handleGoHome = () => {
    navigation.goBack();
  };

  const renderActivity = () => {
    const commonProps = {
      level,
      onItemTap: () => {},
      onComplete: handleActivityComplete,
    };
    try {
      switch (currentActivity) {
        case ACTIVITIES.SIZE_SORT:
          return <SizeSort {...commonProps} />;
        case ACTIVITIES.CATEGORY_SORT:
          return <CategorySort {...commonProps} />;
        case ACTIVITIES.LOGICAL_ORDER:
          return <LogicalOrder {...commonProps} />;
        case ACTIVITIES.ODD_ONE_OUT:
          return <OddOneOut {...commonProps} />;
        case ACTIVITIES.MAZE_PATH:
          return <MazePath {...commonProps} />;
        default:
          return null;
      }
    } catch (e) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoHome} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Logic Land</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={showHint} style={styles.hintButton}>
            <Text style={styles.hintIcon}>💡</Text>
          </TouchableOpacity>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressContainer}>
        {Object.values(ACTIVITIES).map(id => (
          <View
            key={id}
            style={[
              styles.progressDot,
              id === currentActivity && styles.progressDotActive,
              completedActivities[id as ActivityId] && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={currentActivity !== ACTIVITIES.MAZE_PATH}
      >
        {renderActivity()}
      </ScrollView>

      {message && (
        <View style={[styles.floatingMessage, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
          <Text style={styles.floatingText}>{message.text}</Text>
        </View>
      )}

      {hintMessage && (
        <View style={styles.hintMessage}>
          <Text style={styles.hintText}>{hintMessage}</Text>
        </View>
      )}

      <Modal visible={completionVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Great work!</Text>
            <Text style={styles.modalSubtitle}>You completed Logic Land</Text>
            <View style={styles.modalScore}>
              <Text style={styles.modalScoreLabel}>Total Score</Text>
              <Text style={styles.modalScoreValue}>{score}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.homeButton]} onPress={handleGoHome}>
                <Text style={styles.modalButtonText}>🏠 Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.playAgainButton]} onPress={handlePlayAgain}>
                <Text style={styles.modalButtonText}>🔄 Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function LogicLandScreen(props: any) {
  return (
    <ErrorBoundary>
      <LogicLandScreenContent {...props} />
    </ErrorBoundary>
  );
}

// ==================== Styles (with improved modal) ====================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E1F5FE' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0288D1',
  },
  backButton: { padding: 10 },
  backText: { fontSize: 32, color: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  hintButton: { marginRight: 15, padding: 5 },
  hintIcon: { fontSize: 28, color: 'white' },
  scoreBadge: {
    backgroundColor: '#FFB74D',
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
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CCC',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#0288D1',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressDotCompleted: { backgroundColor: '#4CAF50' },
  scrollContent: { flexGrow: 1, padding: 20 },
  activityContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: { fontSize: 24, color: '#333', marginBottom: 20, textAlign: 'center', paddingHorizontal: 10 },
  // SizeSort
  sortRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' },
  sortItem: { margin: 10, justifyContent: 'center', alignItems: 'center' },
  selectedItem: { borderWidth: 4, borderColor: '#4CAF50' },
  sortEmoji: { color: 'white' },
  // CategorySort
  questionItem: { marginBottom: 20 },
  questionEmoji: { fontSize: 80 },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  categoryButton: {
    backgroundColor: '#4FC3F7',
    padding: 15,
    margin: 5,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  categorySelected: { backgroundColor: '#4CAF50' },
  categoryText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  // LogicalOrder
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    backgroundColor: '#FFB74D',
    padding: 15,
    margin: 5,
    borderRadius: 15,
    width: 120,
    alignItems: 'center',
  },
  cardSelected: { backgroundColor: '#4CAF50' },
  cardText: { fontSize: 16, color: 'white', textAlign: 'center' },
  // OddOneOut
  oddRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  oddItem: { margin: 10, padding: 10, borderRadius: 15, backgroundColor: '#E0E0E0' },
  oddSelected: { backgroundColor: '#4FC3F7' },
  oddEmoji: { fontSize: 60 },
  // MazePath
  mazeContainer: {
    width: 300,
    height: 300,
    backgroundColor: '#CDDC39',
    borderRadius: 20,
    position: 'relative',
    marginTop: 20,
  },
  character: {
    position: 'absolute',
    top: 120,
    left: 120,
    zIndex: 10,
  },
  characterEmoji: { fontSize: 50 },
  target: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetEmoji: { fontSize: 50 },
  wall: {
    position: 'absolute',
    backgroundColor: '#795548',
    borderRadius: 5,
  },
  // Floating messages
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
  successMessage: { backgroundColor: '#4CAF50' },
  errorMessage: { backgroundColor: '#F44336' },
  floatingText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  hintMessage: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#FFE082',
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  hintText: { fontSize: 18, color: '#333', fontWeight: '600' },
  // Modal (improved to fit content)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth > 500 ? 400 : '85%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: screenWidth > 500 ? 30 : 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: screenWidth > 500 ? 32 : 28,
    fontWeight: 'bold',
    color: '#0288D1',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: screenWidth > 500 ? 18 : 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  modalScore: { alignItems: 'center', marginBottom: 30 },
  modalScoreLabel: { fontSize: 16, color: '#999' },
  modalScoreValue: {
    fontSize: screenWidth > 500 ? 48 : 40,
    fontWeight: 'bold',
    color: '#FFB74D',
  },
  modalButtons: {
    flexDirection: screenWidth > 400 ? 'row' : 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: 5,
  },
  homeButton: { backgroundColor: '#8D6E63' },
  playAgainButton: { backgroundColor: '#0288D1' },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});