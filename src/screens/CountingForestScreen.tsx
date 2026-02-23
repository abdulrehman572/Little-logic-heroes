// src/screens/CountingForestScreen.tsx
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBoundary from '../components/ErrorBoundary';

// ==================== Audio (optional) ====================
let Audio: any;
try {
  Audio = require('expo-av').Audio;
} catch (e) {
  Audio = null;
}

// ==================== Types & Constants ====================
const ACTIVITIES = {
  ACORN_HUNT: 1,
  MUSHROOM_MATCH: 2,
  NUMBER_LINE: 3,
  RABBIT_GARDEN: 4,
  FOREST_STORE: 5,
} as const;

type ActivityId = typeof ACTIVITIES[keyof typeof ACTIVITIES];

// ==================== Utility Functions ====================
const generateItems = (level: number, type: string) => {
  const count = level === 1 ? 5 : level === 2 ? 8 : 12;
  return Array(count).fill(null).map(() => ({
    id: Math.random().toString(),
    type,
    counted: false,
  }));
};

// ==================== Emoji Item Component ====================
const ItemEmoji = ({ type, counted, size = 80 }: { type: string; counted?: boolean; size?: number }) => {
  let emoji = '🌰';
  let bgColor = '#8B4513';
  if (type === 'mushroom') {
    emoji = '🍄';
    bgColor = '#D2691E';
  } else if (type === 'star') {
    emoji = '⭐';
    bgColor = '#FFD700';
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: counted ? 0.4 : 1,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.6 }}>{emoji}</Text>
    </View>
  );
};

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

// ==================== Activity 1: Acorn Hunt ====================
const AcornHunt = ({ level, onItemTap, onComplete }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [counted, setCounted] = useState(0);
  const [selectedNumeral, setSelectedNumeral] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    setItems(generateItems(level, 'acorn'));
    setCounted(0);
    startTime.current = Date.now();
  }, [level]);

  const handleItemPress = (index: number) => {
    if (!items[index].counted) {
      const newItems = [...items];
      newItems[index].counted = true;
      setItems(newItems);
      setCounted(prev => prev + 1);
      AudioManager.playSound('count');
      onItemTap();
    }
  };

  const handleNumeralSelect = (num: number) => {
    setSelectedNumeral(num);
    const correct = counted === items.length;
    const responseTime = Date.now() - startTime.current;
    if (correct && num === items.length) {
      onComplete(true, responseTime);
    } else {
      onComplete(false, responseTime);
    }
  };

  // Generate three unique options
  const options = [
    items.length,
    Math.min(20, items.length + 1),
    Math.max(1, items.length - 1),
  ];
  // Remove duplicates (in case items.length = 1 => gives [1,2,1])
  const uniqueOptions = [...new Set(options)].sort(() => 0.5 - Math.random());

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Count the acorns!</Text>
      <View style={styles.itemsGrid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, item.counted && styles.itemCounted]}
            onPress={() => handleItemPress(index)}
          >
            <ItemEmoji type="acorn" counted={item.counted} size={80} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numerals}>
        {uniqueOptions.map(num => (
          <TouchableOpacity
            key={num}
            style={[styles.numeralButton, selectedNumeral === num && styles.numeralButtonSelected]}
            onPress={() => handleNumeralSelect(num)}
          >
            <Text style={styles.numeralText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 2: Mushroom Match ====================
const MushroomMatch = ({ level, onItemTap, onComplete }: any) => {
  const targetNumber = level === 1 ? 3 : level === 2 ? 5 : 8;
  const [mushrooms, setMushrooms] = useState<any[]>([]);
  const [placed, setPlaced] = useState(0);
  const startTime = useRef(Date.now());
  const basketRef = useRef<View>(null);
  const [basketLayout, setBasketLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const total = targetNumber + 2;
    setMushrooms(
      Array(total).fill(null).map((_, i) => ({
        id: i,
        pan: new Animated.ValueXY(),
        placed: false,
      }))
    );
    setPlaced(0);
    startTime.current = Date.now();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [level]);

  const createPanResponder = (mushroom: any) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        mushroom.pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const mushroomX = gesture.moveX - 30;
        const mushroomY = gesture.moveY - 30;

        const isInside =
          mushroomX >= basketLayout.x &&
          mushroomX <= basketLayout.x + basketLayout.width &&
          mushroomY >= basketLayout.y &&
          mushroomY <= basketLayout.y + basketLayout.height;

        if (isInside && placed < targetNumber && !mushroom.placed) {
          const targetX = basketLayout.x + basketLayout.width / 2 - (gesture.x0 + 30);
          const targetY = basketLayout.y + basketLayout.height / 2 - (gesture.y0 + 30);

          Animated.spring(mushroom.pan, {
            toValue: { x: targetX, y: targetY },
            useNativeDriver: false,
          }).start();

          mushroom.placed = true;
          setPlaced(prev => prev + 1);
          AudioManager.playSound('count');
          onItemTap();

          if (placed + 1 === targetNumber) {
            onComplete(true, Date.now() - startTime.current);
          }
        } else {
          Animated.spring(mushroom.pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    });
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Put {targetNumber} mushrooms in the basket</Text>

      <Animated.View
        ref={basketRef}
        style={[styles.basketContainer, { transform: [{ scale: pulseAnim }] }]}
        onLayout={() => {
          if (basketRef.current) {
            basketRef.current.measure((x, y, width, height, pageX, pageY) => {
              setBasketLayout({ x: pageX, y: pageY, width, height });
            });
          }
        }}
        collapsable={false}
      >
        <View style={styles.basketBody}>
          <View style={styles.basketHandle} />
          <View style={styles.basketWoven} />
          <View style={styles.basketShadow} />
        </View>
        <Text style={styles.basketCount}>{placed}/{targetNumber}</Text>
      </Animated.View>

      <View style={styles.mushroomsContainer}>
        {mushrooms.map(m => !m.placed && (
          <Animated.View
            key={m.id}
            style={[{ transform: [{ translateX: m.pan.x }, { translateY: m.pan.y }] }, styles.mushroom]}
            {...createPanResponder(m).panHandlers}
            collapsable={false}
          >
            <ItemEmoji type="mushroom" size={60} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 3: Number Line (Tap-based) ====================
const NumberLine = ({ level, onItemTap, onComplete }: any) => {
  const maxNumber = level === 1 ? 5 : level === 2 ? 10 : 20;
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
  const [missingPositions, setMissingPositions] = useState<number[]>([]);
  const [availableTiles, setAvailableTiles] = useState<number[]>([]);
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const shuffled = [...numbers].sort(() => 0.5 - Math.random());
    const missing = shuffled.slice(0, 3).sort((a, b) => a - b);
    setMissingPositions(missing);
    setAvailableTiles(missing);
    setPlaced({});
    setSelectedTile(null);
    startTime.current = Date.now();
  }, [level]);

  const handleTilePress = (num: number) => {
    setSelectedTile(num);
    AudioManager.playSound('click');
  };

  const handleSlotPress = (slotNum: number) => {
    if (selectedTile === null) return;

    if (selectedTile === slotNum && !placed[slotNum]) {
      setPlaced(prev => ({ ...prev, [slotNum]: true }));
      setAvailableTiles(prev => prev.filter(n => n !== slotNum));
      setSelectedTile(null);
      AudioManager.playSound('count');
      onItemTap();

      if (Object.keys(placed).length + 1 === missingPositions.length) {
        onComplete(true, Date.now() - startTime.current);
      }
    } else {
      AudioManager.playSound('gentleError');
      setSelectedTile(null);
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Tap a number, then tap the ? to place it</Text>

      <View style={styles.numberLine}>
        {numbers.map(num => {
          const isMissing = missingPositions.includes(num);
          const isPlaced = placed[num];

          if (isMissing && !isPlaced) {
            return (
              <TouchableOpacity key={`slot_${num}`} style={styles.slot} onPress={() => handleSlotPress(num)}>
                <Text style={styles.slotText}>?</Text>
              </TouchableOpacity>
            );
          }

          return (
            <View key={num} style={styles.numberBox}>
              <Text style={styles.numberText}>{num}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.tilesContainer}>
        {availableTiles.map(num => (
          <TouchableOpacity
            key={num}
            style={[styles.tile, selectedTile === num && styles.tileSelected]}
            onPress={() => handleTilePress(num)}
          >
            <Text style={styles.tileText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTile && (
        <View style={styles.selectedHint}>
          <Text style={styles.selectedHintText}>Selected: {selectedTile} – tap the correct ?</Text>
        </View>
      )}
    </View>
  );
};

// ==================== Activity 4: Rabbit's Garden (Top/Bottom) ====================
const RabbitGarden = ({ level, onItemTap, onComplete }: any) => {
  const [topCount, setTopCount] = useState(0);
  const [bottomCount, setBottomCount] = useState(0);
  const [question, setQuestion] = useState<'more' | 'less'>('more');
  const startTime = useRef(Date.now());

  useEffect(() => {
    const max = level === 1 ? 5 : level === 2 ? 8 : 12;
    const top = Math.floor(Math.random() * max) + 1;
    const bottom = Math.floor(Math.random() * max) + 1;
    setTopCount(top);
    setBottomCount(bottom);
    setQuestion(Math.random() > 0.5 ? 'more' : 'less');
    startTime.current = Date.now();
  }, [level]);

  const handleChoice = (chooseTop: boolean) => {
    const correct = question === 'more'
      ? (chooseTop && topCount > bottomCount) || (!chooseTop && bottomCount > topCount)
      : (chooseTop && topCount < bottomCount) || (!chooseTop && bottomCount < topCount);
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    onComplete(correct, responseTime);
  };

  const renderCarrots = (count: number, side: 'top' | 'bottom') => {
    const carrots = [];
    for (let i = 0; i < count; i++) {
      carrots.push(<Text key={`${side}-${i}-${count}`} style={styles.carrot}>🥕</Text>);
    }
    return <View style={styles.carrotRow}>{carrots}</View>;
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Which garden has {question} carrots?</Text>
      <View style={styles.gardens}>
        <TouchableOpacity style={styles.garden} onPress={() => handleChoice(true)}>
          <Text style={styles.gardenLabel}>Top</Text>
          {renderCarrots(topCount, 'top')}
        </TouchableOpacity>
        <TouchableOpacity style={styles.garden} onPress={() => handleChoice(false)}>
          <Text style={styles.gardenLabel}>Bottom</Text>
          {renderCarrots(bottomCount, 'bottom')}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================== Activity 5: Forest Store ====================
const ForestStore = ({ level, onItemTap, onComplete }: any) => {
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const max = level === 1 ? 3 : level === 2 ? 5 : 8;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * (max - a + 1)) + 1;
    setFirst(a);
    setSecond(b);
    const correct = a + b;
    const wrong1 = Math.max(1, correct - 1);
    const wrong2 = Math.min(max * 2, correct + 1);
    // Ensure three unique options
    const opts = [correct, wrong1, wrong2];
    const uniqueOpts = [...new Set(opts)];
    // If we lost one due to duplicate, add a fallback
    while (uniqueOpts.length < 3) {
      uniqueOpts.push(Math.floor(Math.random() * (max * 2)) + 1);
    }
    setOptions(uniqueOpts.sort(() => 0.5 - Math.random()));
    startTime.current = Date.now();
  }, [level]);

  const handleAnswer = (ans: number) => {
    setSelected(ans);
    const correct = ans === first + second;
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    onComplete(correct, responseTime);
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Forest Store</Text>
      <Text style={styles.problem}>
        {first} + {second} = ?
      </Text>
      <View style={styles.numerals}>
        {options.map(num => (
          <TouchableOpacity
            key={num}
            style={[styles.numeralButton, selected === num && styles.numeralButtonSelected]}
            onPress={() => handleAnswer(num)}
          >
            <Text style={styles.numeralText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Main Screen Component ====================
function CountingForestScreenContent({ navigation }: any) {
  const [currentActivity, setCurrentActivity] = useState<ActivityId>(ACTIVITIES.ACORN_HUNT);
  const [completedActivities, setCompletedActivities] = useState<Record<ActivityId, boolean>>({} as any);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [completionVisible, setCompletionVisible] = useState(false);
  const { level, adjustDifficulty } = useAdaptiveDifficulty('countingForest');
  const messageTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    AudioManager.loadSounds();
  }, []);

  const showTemporaryMessage = (text: string, type: 'success' | 'error') => {
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    setMessage({ text, type });
    messageTimeout.current = setTimeout(() => setMessage(null), 1500);
  };

  const handleActivityComplete = (success: boolean, responseTime: number) => {
    adjustDifficulty(success, responseTime);
    if (success) {
      AudioManager.playSound('success');
      setScore(prev => prev + 1);
      showTemporaryMessage('Great job!', 'success');
      setCompletedActivities(prev => ({ ...prev, [currentActivity]: true }));
      if (currentActivity < ACTIVITIES.FOREST_STORE) {
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
    setCurrentActivity(ACTIVITIES.ACORN_HUNT);
    setCompletedActivities({});
    setScore(0);
    setCompletionVisible(false);
  };

  const handleGoHome = () => navigation.goBack();

  const renderActivity = () => {
    const commonProps = { level, onItemTap: () => {}, onComplete: handleActivityComplete };
    try {
      switch (currentActivity) {
        case ACTIVITIES.ACORN_HUNT:
          return <AcornHunt key={currentActivity} {...commonProps} />;
        case ACTIVITIES.MUSHROOM_MATCH:
          return <MushroomMatch key={currentActivity} {...commonProps} />;
        case ACTIVITIES.NUMBER_LINE:
          return <NumberLine key={currentActivity} {...commonProps} />;
        case ACTIVITIES.RABBIT_GARDEN:
          return <RabbitGarden key={currentActivity} {...commonProps} />;
        case ACTIVITIES.FOREST_STORE:
          return <ForestStore key={currentActivity} {...commonProps} />;
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
        <Text style={styles.title}>Counting Forest</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}</Text>
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
      <View style={styles.mainContent}>{renderActivity()}</View>

      {message && (
        <View
          style={[
            styles.floatingMessage,
            message.type === 'success' ? styles.successMessage : styles.errorMessage,
          ]}
        >
          <Text style={styles.floatingText}>{message.text}</Text>
        </View>
      )}

      <Modal visible={completionVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Great work!</Text>
            <Text style={styles.modalSubtitle}>You completed the Counting Forest</Text>
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

export default function CountingForestScreen(props: any) {
  return (
    <ErrorBoundary>
      <CountingForestScreenContent {...props} />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8F5E9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E7D32',
  },
  backButton: { padding: 10 },
  backText: { fontSize: 32, color: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
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
    backgroundColor: '#FFB74D',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressDotCompleted: { backgroundColor: '#4CAF50' },
  mainContent: { flex: 1, padding: 20 },
  activityContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: { fontSize: 24, color: '#333', marginBottom: 20, textAlign: 'center' },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 30 },
  item: { margin: 10 },
  itemCounted: { opacity: 0.4 },
  numerals: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  numeralButton: {
    backgroundColor: '#FFB74D',
    padding: 20,
    margin: 10,
    borderRadius: 40,
    minWidth: 80,
    alignItems: 'center',
  },
  numeralButtonSelected: { backgroundColor: '#2E7D32' },
  numeralText: { fontSize: 32, color: 'white', fontWeight: 'bold' },

  basketContainer: { width: 220, height: 140, marginBottom: 40, justifyContent: 'center', alignItems: 'center' },
  basketBody: {
    width: '100%',
    height: '100%',
    backgroundColor: '#A0522D',
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#8B4513',
    overflow: 'visible',
    position: 'relative',
  },
  basketHandle: {
    position: 'absolute',
    top: -20,
    left: 50,
    width: 120,
    height: 40,
    borderWidth: 8,
    borderColor: '#8B4513',
    borderRadius: 40,
    backgroundColor: 'transparent',
    transform: [{ rotate: '5deg' }],
  },
  basketWoven: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 2,
    borderColor: '#CD853F',
    borderRadius: 40,
    backgroundColor: 'transparent',
  },
  basketShadow: {
    position: 'absolute',
    bottom: -5,
    left: 20,
    right: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
  },
  basketCount: {
    position: 'absolute',
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    top: 40,
  },

  mushroomsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  mushroom: { margin: 10 },

  numberLine: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 },
  numberBox: { width: 60, height: 60, backgroundColor: '#2E7D32', borderRadius: 10, margin: 8, justifyContent: 'center', alignItems: 'center' },
  numberText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  slot: {
    width: 60,
    height: 60,
    backgroundColor: '#EEE',
    borderRadius: 10,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  slotText: { fontSize: 20, color: '#2E7D32' },
  tilesContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, paddingBottom: 20, flexWrap: 'wrap' },
  tile: { width: 70, height: 70, backgroundColor: '#FFB74D', borderRadius: 15, margin: 10, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  tileSelected: { backgroundColor: '#FFB74D', borderWidth: 4, borderColor: '#2E7D32' },
  tileText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  selectedHint: { marginTop: 20, padding: 10, backgroundColor: '#FFF9C4', borderRadius: 10 },
  selectedHintText: { fontSize: 18, color: '#2E7D32', fontWeight: 'bold' },

  gardens: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, flexWrap: 'wrap' },
  garden: { alignItems: 'center', padding: 20, backgroundColor: '#EFE6DD', borderRadius: 15, width: '40%', minWidth: 150, margin: 10 },
  gardenLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  carrotRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  carrot: { fontSize: 30, margin: 2 },

  problem: { fontSize: 48, fontWeight: 'bold', marginBottom: 30, color: '#2E7D32' },

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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  modalSubtitle: { fontSize: 18, color: '#666', marginBottom: 20 },
  modalScore: { alignItems: 'center', marginBottom: 30 },
  modalScoreLabel: { fontSize: 16, color: '#999' },
  modalScoreValue: { fontSize: 48, fontWeight: 'bold', color: '#FFB74D' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', gap: 10 },
  modalButton: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, minWidth: 120, alignItems: 'center', marginVertical: 5 },
  homeButton: { backgroundColor: '#8D6E63' },
  playAgainButton: { backgroundColor: '#2E7D32' },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});