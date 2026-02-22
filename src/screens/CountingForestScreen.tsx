// src/screens/CountingForestScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  PanResponder,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    id: Math.random(),
    type,
    counted: false,
  }));
};

// ==================== Emoji Item Component ====================
const ItemEmoji = ({ type, counted, size = 80 }: { type: string; counted?: boolean; size?: number }) => {
  let emoji = '🌰'; // acorn default
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
      } catch (e) {
        console.log(`Failed to load sound ${key}`);
      }
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

  const adjustDifficulty = (isCorrect: boolean, responseTime: number) => {
    // Simplified – just track for now
  };

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
      onItemTap(); // haptic or extra feedback if needed
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

  const options = [
    items.length,
    Math.min(20, items.length + 1),
    Math.max(1, items.length - 1),
  ].sort(() => 0.5 - Math.random());

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Count the acorns!</Text>
      <View style={styles.itemsGrid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.item, item.counted && styles.itemCounted]}
            onPress={() => handleItemPress(index)}
          >
            <ItemEmoji type="acorn" counted={item.counted} size={80} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numerals}>
        {options.map(num => (
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
  const basketPosition = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const total = targetNumber + 2;
    setMushrooms(
      Array(total).fill(null).map((_, i) => ({
        id: i,
        pan: new Animated.ValueXY(),
        placed: false,
      }))
    );
    startTime.current = Date.now();
  }, [level]);

  const isInDropZone = (gesture: any) => {
    const zone = basketPosition.current;
    return (
      gesture.moveX > zone.x &&
      gesture.moveX < zone.x + zone.width &&
      gesture.moveY > zone.y &&
      gesture.moveY < zone.y + zone.height
    );
  };

  const createPanResponder = (mushroom: any) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: mushroom.pan.x, dy: mushroom.pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        if (isInDropZone(gesture) && placed < targetNumber && !mushroom.placed) {
          Animated.spring(mushroom.pan, {
            toValue: {
              x: basketPosition.current.x - (mushroom.pan.x._value + 30),
              y: basketPosition.current.y - (mushroom.pan.y._value + 30),
            },
            useNativeDriver: true,
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
            useNativeDriver: true,
          }).start();
        }
      },
    });
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Put {targetNumber} mushrooms in the basket</Text>
      <View
        style={styles.basket}
        onLayout={event => {
          const layout = event.nativeEvent.layout;
          basketPosition.current = {
            x: layout.x,
            y: layout.y,
            width: layout.width,
            height: layout.height,
          };
        }}
      >
        <Text style={styles.basketCount}>{placed}/{targetNumber}</Text>
      </View>
      <View style={styles.mushroomsContainer}>
        {mushrooms.map(m => !m.placed && (
          <Animated.View
            key={m.id}
            style={[m.pan.getLayout(), styles.mushroom]}
            {...createPanResponder(m).panHandlers}
          >
            <ItemEmoji type="mushroom" size={60} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 3: Number Line ====================
const NumberLine = ({ level, onItemTap, onComplete }: any) => {
  const maxNumber = level === 1 ? 5 : level === 2 ? 10 : 20;
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
  const [missingPositions, setMissingPositions] = useState<number[]>([]);
  const [tiles, setTiles] = useState<any[]>([]);
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const startTime = useRef(Date.now());
  const dropZones = useRef<Record<string, any>>({});

  useEffect(() => {
    const shuffled = [...numbers].sort(() => 0.5 - Math.random());
    const missing = shuffled.slice(0, 3).sort((a, b) => a - b);
    setMissingPositions(missing);
    setTiles(
      missing.map(num => ({
        id: num,
        value: num,
        pan: new Animated.ValueXY(),
      }))
    );
    startTime.current = Date.now();
  }, [level]);

  const isInDropZone = (gesture: any, zone: any) => {
    return (
      gesture.moveX > zone.x &&
      gesture.moveX < zone.x + zone.width &&
      gesture.moveY > zone.y &&
      gesture.moveY < zone.y + zone.height
    );
  };

  const createPanResponder = (tile: any) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: tile.pan.x, dy: tile.pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        const zone = dropZones.current[`zone_${tile.value}`];
        if (zone && isInDropZone(gesture, zone)) {
          Animated.spring(tile.pan, {
            toValue: { x: zone.x - tile.initialX, y: zone.y - tile.initialY },
            useNativeDriver: true,
          }).start();
          setPlaced(prev => ({ ...prev, [tile.value]: true }));
          onItemTap();
          if (Object.keys(placed).length + 1 === missingPositions.length) {
            onComplete(true, Date.now() - startTime.current);
          }
        } else {
          Animated.spring(tile.pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Fill in the missing numbers</Text>
      <View style={styles.numberLine}>
        {numbers.map(num => {
          const isMissing = missingPositions.includes(num);
          const isPlaced = placed[num];
          if (isMissing && !isPlaced) {
            return (
              <View
                key={`slot_${num}`}
                style={styles.slot}
                onLayout={event => {
                  const layout = event.nativeEvent.layout;
                  dropZones.current[`zone_${num}`] = {
                    x: layout.x,
                    y: layout.y,
                    width: layout.width,
                    height: layout.height,
                  };
                }}
              >
                <Text style={styles.slotText}>?</Text>
              </View>
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
        {tiles.map(tile => {
          if (placed[tile.value]) return null;
          return (
            <Animated.View
              key={tile.id}
              style={[tile.pan.getLayout(), styles.tile]}
              {...createPanResponder(tile).panHandlers}
              onLayout={event => {
                const layout = event.nativeEvent.layout;
                tile.initialX = layout.x;
                tile.initialY = layout.y;
              }}
            >
              <Text style={styles.tileText}>{tile.value}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

// ==================== Activity 4: Rabbit's Garden ====================
const RabbitGarden = ({ level, onItemTap, onComplete }: any) => {
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [question, setQuestion] = useState<'more' | 'less'>('more');
  const startTime = useRef(Date.now());

  useEffect(() => {
    const max = level === 1 ? 5 : level === 2 ? 8 : 12;
    const left = Math.floor(Math.random() * max) + 1;
    const right = Math.floor(Math.random() * max) + 1;
    setLeftCount(left);
    setRightCount(right);
    setQuestion(Math.random() > 0.5 ? 'more' : 'less');
    startTime.current = Date.now();
  }, [level]);

  const handleChoice = (chooseLeft: boolean) => {
    const correct = question === 'more'
      ? (chooseLeft && leftCount > rightCount) || (!chooseLeft && rightCount > leftCount)
      : (chooseLeft && leftCount < rightCount) || (!chooseLeft && rightCount < leftCount);
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    onComplete(correct, responseTime);
  };

  const renderCarrots = (count: number) => {
    const carrots = [];
    for (let i = 0; i < count; i++) {
      carrots.push(<Text key={i} style={styles.carrot}>🥕</Text>);
    }
    return <View style={styles.carrotRow}>{carrots}</View>;
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Which garden has {question} carrots?</Text>
      <View style={styles.gardens}>
        <TouchableOpacity style={styles.garden} onPress={() => handleChoice(true)}>
          <Text style={styles.gardenLabel}>Left</Text>
          {renderCarrots(leftCount)}
        </TouchableOpacity>
        <TouchableOpacity style={styles.garden} onPress={() => handleChoice(false)}>
          <Text style={styles.gardenLabel}>Right</Text>
          {renderCarrots(rightCount)}
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
    setOptions([correct, wrong1, wrong2].sort(() => 0.5 - Math.random()));
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
    messageTimeout.current = setTimeout(() => {
      setMessage(null);
    }, 1500);
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
      if (currentActivity < ACTIVITIES.FOREST_STORE) {
        setTimeout(() => setCurrentActivity((currentActivity + 1) as ActivityId), 1500);
      } else {
        // All activities completed – show completion screen after a short delay
        setTimeout(() => setCompletionVisible(true), 1500);
      }
    } else {
      AudioManager.playSound('gentleError');
      showTemporaryMessage('Try again!', 'error');
      // Do not advance, stay on same activity
    }
  };

  const handlePlayAgain = () => {
    setCurrentActivity(ACTIVITIES.ACORN_HUNT);
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
      onItemTap: () => {}, // could be used for subtle feedback
      onComplete: handleActivityComplete,
    };
    try {
      switch (currentActivity) {
        case ACTIVITIES.ACORN_HUNT:
          return <AcornHunt {...commonProps} />;
        case ACTIVITIES.MUSHROOM_MATCH:
          return <MushroomMatch {...commonProps} />;
        case ACTIVITIES.NUMBER_LINE:
          return <NumberLine {...commonProps} />;
        case ACTIVITIES.RABBIT_GARDEN:
          return <RabbitGarden {...commonProps} />;
        case ACTIVITIES.FOREST_STORE:
          return <ForestStore {...commonProps} />;
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
      <View style={styles.mainContent}>
        {renderActivity()}
      </View>

      {/* Floating message */}
      {message && (
        <View style={[styles.floatingMessage, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
          <Text style={styles.floatingText}>{message.text}</Text>
        </View>
      )}

      {/* Completion Modal */}
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

// ==================== Export with Error Boundary ====================
export default function CountingForestScreen(props: any) {
  return (
    <ErrorBoundary>
      <CountingForestScreenContent {...props} />
    </ErrorBoundary>
  );
}

// ==================== Global Styles ====================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E7D32',
  },
  backButton: {
    padding: 10,
  },
  backText: {
    fontSize: 32,
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreBadge: {
    backgroundColor: '#FFB74D',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
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
  progressDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  activityContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  item: {
    margin: 10,
  },
  itemCounted: {
    opacity: 0.4,
  },
  numerals: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  numeralButton: {
    backgroundColor: '#FFB74D',
    padding: 20,
    margin: 10,
    borderRadius: 40,
    minWidth: 80,
    alignItems: 'center',
  },
  numeralButtonSelected: {
    backgroundColor: '#2E7D32',
  },
  numeralText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  basket: {
    width: 200,
    height: 120,
    backgroundColor: '#8D6E63',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  basketCount: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  mushroomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mushroom: {
    margin: 10,
  },
  numberLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  numberBox: {
    width: 50,
    height: 50,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  slot: {
    width: 50,
    height: 50,
    backgroundColor: '#CCC',
    borderRadius: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  slotText: {
    fontSize: 20,
    color: '#2E7D32',
  },
  tilesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tile: {
    width: 60,
    height: 60,
    backgroundColor: '#FFB74D',
    borderRadius: 15,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  tileText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  gardens: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  garden: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EFE6DD',
    borderRadius: 15,
    width: '40%',
  },
  gardenLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  carrotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  carrot: {
    fontSize: 30,
    margin: 2,
  },
  problem: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2E7D32',
  },
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
  successMessage: {
    backgroundColor: '#4CAF50',
  },
  errorMessage: {
    backgroundColor: '#F44336',
  },
  floatingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  modalScore: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalScoreLabel: {
    fontSize: 16,
    color: '#999',
  },
  modalScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFB74D',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#8D6E63',
  },
  playAgainButton: {
    backgroundColor: '#2E7D32',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});