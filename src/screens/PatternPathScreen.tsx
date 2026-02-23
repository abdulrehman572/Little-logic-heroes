// src/screens/PatternPathScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import ErrorBoundary from '../components/ErrorBoundary';

const { width } = Dimensions.get('window');

// ==================== Types & Constants ====================
const ACTIVITIES = {
  BEAD_PATTERN: 1,
  SHAPE_PATTERN: 2,
  COLOR_PATTERN: 3,
  SIZE_PATTERN: 4,
  PATTERN_FILL: 5,
} as const;

type ActivityId = typeof ACTIVITIES[keyof typeof ACTIVITIES];

type PatternItem = {
  id: string;
  type: 'bead' | 'shape' | 'color' | 'size';
  value: string | number;
  color?: string;
};

// ==================== Pattern Generator ====================
const generatePattern = (
  level: number,
  patternType: string
): { pattern: PatternItem[]; missingIndex: number; options: any[] } => {
  const length = level === 1 ? 4 : level === 2 ? 6 : 8;
  let items: PatternItem[] = [];
  let missingIndex = Math.floor(Math.random() * length);

  switch (patternType) {
    case 'bead':
      const beadTypes = ['🔴', '🔵', '🟢'];
      for (let i = 0; i < length; i++) {
        items.push({
          id: `bead-${i}`,
          type: 'bead',
          value: beadTypes[i % 3],
        });
      }
      break;
    case 'shape':
      const shapes = ['⬤', '■', '▲'];
      const colors = ['#FF6B6B', '#4ECDC4', '#FFB347'];
      for (let i = 0; i < length; i++) {
        items.push({
          id: `shape-${i}`,
          type: 'shape',
          value: shapes[i % 3],
          color: colors[i % 3],
        });
      }
      break;
    case 'color':
      const colorValues = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107'];
      for (let i = 0; i < length; i++) {
        items.push({
          id: `color-${i}`,
          type: 'color',
          value: colorValues[i % 4],
        });
      }
      break;
    case 'size':
      for (let i = 0; i < length; i++) {
        items.push({
          id: `size-${i}`,
          type: 'size',
          value: i % 2 === 0 ? 'big' : 'small',
        });
      }
      break;
    default:
      break;
  }

  const correctValue = items[missingIndex].value;
  const allPossible = Array.from(new Set(items.map(i => i.value)));
  const wrongOptions = allPossible.filter(v => v !== correctValue);
  const options = [correctValue, ...wrongOptions.slice(0, 2)].sort(() => 0.5 - Math.random());

  return { pattern: items, missingIndex, options };
};

// ==================== Pattern Item Renderer ====================
const PatternItemComponent = ({ item, size = 60 }: { item: PatternItem; size?: number }) => {
  let content: JSX.Element;

  switch (item.type) {
    case 'bead':
      content = <Text style={{ fontSize: size }}>{item.value}</Text>;
      break;
    case 'shape':
      content = (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: item.value === '⬤' ? size / 2 : item.value === '■' ? 10 : 0,
            backgroundColor: item.color || '#888',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: size * 0.6, color: 'white' }}>{item.value}</Text>
        </View>
      );
      break;
    case 'color':
      content = (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: item.value as string,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        />
      );
      break;
    case 'size':
      const sz = item.value === 'big' ? size : size / 2;
      content = (
        <View
          style={{
            width: sz,
            height: sz,
            backgroundColor: '#FFB74D',
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        />
      );
      break;
    default:
      content = <Text style={{ fontSize: 24 }}>?</Text>;
  }

  return <View style={{ margin: 5 }}>{content}</View>;
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
    // Implement logic if needed
  };

  return { level, adjustDifficulty };
};

// ==================== Activity 1: Bead Pattern (with Hint) ====================
const BeadPattern = ({ level, onItemTap, onComplete }: any) => {
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [missingIndex, setMissingIndex] = useState(-1);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filled, setFilled] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const startTime = useRef(Date.now());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hintTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const { pattern, missingIndex, options } = generatePattern(level, 'bead');
    setPattern(pattern);
    setMissingIndex(missingIndex);
    setOptions(options);
    setSelected(null);
    setFilled(false);
    setHintVisible(false);
    startTime.current = Date.now();
  }, [level]);

  const showHint = () => {
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    setHintVisible(true);
    hintTimeout.current = setTimeout(() => setHintVisible(false), 2000);
  };

  const handleSelect = (value: any) => {
    setSelected(value);
    const correct = value === pattern[missingIndex].value;
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    if (correct) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      setFilled(true);
      onComplete(true, responseTime);
    } else {
      onComplete(false, responseTime);
    }
  };

  return (
    <Animated.View style={[styles.activityContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.instruction}>Complete the bead pattern</Text>

      {/* Pattern row */}
      <View style={styles.patternRow}>
        {pattern.map((item, idx) => {
          if (idx === missingIndex) {
            if (filled) {
              return (
                <View key={item.id} style={styles.patternItem}>
                  <PatternItemComponent item={item} size={50} />
                </View>
              );
            } else if (hintVisible) {
              return (
                <View key={item.id} style={[styles.missingSlot, styles.hintSlot]}>
                  <Text style={styles.hintText}>{item.value}</Text>
                </View>
              );
            } else {
              return (
                <View key={item.id} style={styles.missingSlot}>
                  <Text style={styles.missingText}>?</Text>
                </View>
              );
            }
          }
          return (
            <View key={item.id} style={styles.patternItem}>
              <PatternItemComponent item={item} size={50} />
            </View>
          );
        })}
      </View>

      {/* Options */}
      <View style={styles.optionsRow}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={`opt-${i}`}
            style={[styles.optionButton, selected === opt && styles.optionSelected]}
            onPress={() => handleSelect(opt)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Hint button */}
      {!filled && (
        <TouchableOpacity style={styles.hintButton} onPress={showHint}>
          <Text style={styles.hintButtonText}>💡 Hint</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ==================== Activity 2: Shape Pattern (with Hint) ====================
const ShapePattern = ({ level, onItemTap, onComplete }: any) => {
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [missingIndex, setMissingIndex] = useState(-1);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filled, setFilled] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const startTime = useRef(Date.now());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hintTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const { pattern, missingIndex, options } = generatePattern(level, 'shape');
    setPattern(pattern);
    setMissingIndex(missingIndex);
    setOptions(options);
    setSelected(null);
    setFilled(false);
    setHintVisible(false);
    startTime.current = Date.now();
  }, [level]);

  const showHint = () => {
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    setHintVisible(true);
    hintTimeout.current = setTimeout(() => setHintVisible(false), 2000);
  };

  const handleSelect = (value: any) => {
    setSelected(value);
    const correct = value === pattern[missingIndex].value;
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    if (correct) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      setFilled(true);
      onComplete(true, responseTime);
    } else {
      onComplete(false, responseTime);
    }
  };

  return (
    <Animated.View style={[styles.activityContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.instruction}>Complete the shape pattern</Text>

      <View style={styles.patternRow}>
        {pattern.map((item, idx) => {
          if (idx === missingIndex) {
            if (filled) {
              return (
                <View key={item.id} style={styles.patternItem}>
                  <PatternItemComponent item={item} size={60} />
                </View>
              );
            } else if (hintVisible) {
              return (
                <View key={item.id} style={[styles.missingSlot, styles.hintSlot]}>
                  <Text style={styles.hintText}>{item.value}</Text>
                </View>
              );
            } else {
              return (
                <View key={item.id} style={styles.missingSlot}>
                  <Text style={styles.missingText}>?</Text>
                </View>
              );
            }
          }
          return (
            <View key={item.id} style={styles.patternItem}>
              <PatternItemComponent item={item} size={60} />
            </View>
          );
        })}
      </View>

      <View style={styles.optionsRow}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={`opt-${i}`}
            style={[styles.optionButton, selected === opt && styles.optionSelected]}
            onPress={() => handleSelect(opt)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!filled && (
        <TouchableOpacity style={styles.hintButton} onPress={showHint}>
          <Text style={styles.hintButtonText}>💡 Hint</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ==================== Activity 3: Color Pattern (with Hint) ====================
const ColorPattern = ({ level, onItemTap, onComplete }: any) => {
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [missingIndex, setMissingIndex] = useState(-1);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filled, setFilled] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const startTime = useRef(Date.now());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hintTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const { pattern, missingIndex, options } = generatePattern(level, 'color');
    setPattern(pattern);
    setMissingIndex(missingIndex);
    setOptions(options);
    setSelected(null);
    setFilled(false);
    setHintVisible(false);
    startTime.current = Date.now();
  }, [level]);

  const showHint = () => {
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    setHintVisible(true);
    hintTimeout.current = setTimeout(() => setHintVisible(false), 2000);
  };

  const handleSelect = (value: any) => {
    setSelected(value);
    const correct = value === pattern[missingIndex].value;
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    if (correct) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      setFilled(true);
      onComplete(true, responseTime);
    } else {
      onComplete(false, responseTime);
    }
  };

  return (
    <Animated.View style={[styles.activityContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.instruction}>Complete the color pattern</Text>

      <View style={styles.patternRow}>
        {pattern.map((item, idx) => {
          if (idx === missingIndex) {
            if (filled) {
              return (
                <View key={item.id} style={styles.patternItem}>
                  <PatternItemComponent item={item} size={50} />
                </View>
              );
            } else if (hintVisible) {
              return (
                <View key={item.id} style={[styles.missingSlot, styles.hintSlot]}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.value as string }} />
                </View>
              );
            } else {
              return (
                <View key={item.id} style={styles.missingSlot}>
                  <Text style={styles.missingText}>?</Text>
                </View>
              );
            }
          }
          return (
            <View key={item.id} style={styles.patternItem}>
              <PatternItemComponent item={item} size={50} />
            </View>
          );
        })}
      </View>

      <View style={styles.optionsRow}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={`opt-${i}`}
            style={[
              styles.optionButton,
              { backgroundColor: opt as string },
              selected === opt && styles.optionSelected,
            ]}
            onPress={() => handleSelect(opt)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}> </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!filled && (
        <TouchableOpacity style={styles.hintButton} onPress={showHint}>
          <Text style={styles.hintButtonText}>💡 Hint</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ==================== Activity 4: Size Pattern (with Hint) ====================
const SizePattern = ({ level, onItemTap, onComplete }: any) => {
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [missingIndex, setMissingIndex] = useState(-1);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filled, setFilled] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const startTime = useRef(Date.now());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hintTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const { pattern, missingIndex, options } = generatePattern(level, 'size');
    setPattern(pattern);
    setMissingIndex(missingIndex);
    setOptions(options);
    setSelected(null);
    setFilled(false);
    setHintVisible(false);
    startTime.current = Date.now();
  }, [level]);

  const showHint = () => {
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    setHintVisible(true);
    hintTimeout.current = setTimeout(() => setHintVisible(false), 2000);
  };

  const handleSelect = (value: any) => {
    setSelected(value);
    const correct = value === pattern[missingIndex].value;
    const responseTime = Date.now() - startTime.current;
    onItemTap();
    if (correct) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      setFilled(true);
      onComplete(true, responseTime);
    } else {
      onComplete(false, responseTime);
    }
  };

  return (
    <Animated.View style={[styles.activityContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.instruction}>Complete the size pattern</Text>

      <View style={styles.patternRow}>
        {pattern.map((item, idx) => {
          if (idx === missingIndex) {
            if (filled) {
              return (
                <View key={item.id} style={styles.patternItem}>
                  <PatternItemComponent item={item} size={item.value === 'big' ? 60 : 30} />
                </View>
              );
            } else if (hintVisible) {
              const sz = item.value === 'big' ? 40 : 20;
              return (
                <View key={item.id} style={[styles.missingSlot, styles.hintSlot]}>
                  <View style={{ width: sz, height: sz, backgroundColor: '#FFB74D', borderRadius: 8 }} />
                </View>
              );
            } else {
              return (
                <View key={item.id} style={styles.missingSlot}>
                  <Text style={styles.missingText}>?</Text>
                </View>
              );
            }
          }
          return (
            <View key={item.id} style={styles.patternItem}>
              <PatternItemComponent item={item} size={item.value === 'big' ? 60 : 30} />
            </View>
          );
        })}
      </View>

      <View style={styles.optionsRow}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={`opt-${i}`}
            style={[styles.optionButton, styles.sizeOption, selected === opt && styles.optionSelected]}
            onPress={() => handleSelect(opt)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!filled && (
        <TouchableOpacity style={styles.hintButton} onPress={showHint}>
          <Text style={styles.hintButtonText}>💡 Hint</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ==================== Activity 5: Pattern Fill (Tap to Select) ====================
const PatternFill = ({ level, onItemTap, onComplete }: any) => {
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [missingIndices, setMissingIndices] = useState<number[]>([]);
  const [tiles, setTiles] = useState<{ id: number; value: any; used: boolean }[]>([]);
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const errorTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const { pattern: fullPattern } = generatePattern(level, 'bead');
    const indices = Array.from({ length: fullPattern.length }, (_, i) => i)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .sort((a, b) => a - b);
    setMissingIndices(indices);
    setPattern(fullPattern);

    const initialTiles = indices.map(idx => ({
      id: idx,
      value: fullPattern[idx].value,
      used: false,
    }));
    setTiles(initialTiles);
    startTime.current = Date.now();
  }, [level]);

  const showError = (msg: string) => {
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    setErrorMessage(msg);
    errorTimeout.current = setTimeout(() => setErrorMessage(null), 1500);
  };

  const handleTilePress = (tileId: number) => {
    setSelectedTileId(prev => (prev === tileId ? null : tileId));
  };

  const handleSlotPress = (slotIdx: number) => {
    if (selectedTileId === null) {
      showError('Tap a bead first!');
      return;
    }

    const tile = tiles.find(t => t.id === selectedTileId);
    if (!tile || tile.used) {
      setSelectedTileId(null);
      showError('That bead is already used.');
      return;
    }

    const correctValue = pattern[slotIdx].value;
    if (tile.value === correctValue) {
      setPlaced(prev => ({ ...prev, [slotIdx]: true }));
      setTiles(prev =>
        prev.map(t => (t.id === selectedTileId ? { ...t, used: true } : t))
      );
      setSelectedTileId(null);
      onItemTap();

      const allPlaced = missingIndices.every(idx => placed[idx] || idx === slotIdx);
      if (allPlaced) {
        onComplete(true, Date.now() - startTime.current);
      }
    } else {
      showError('Not the right bead for this spot');
    }
  };

  const handleCancelSelection = () => {
    setSelectedTileId(null);
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Tap a bead, then tap the missing spot to place it</Text>

      <View style={styles.patternRow}>
        {pattern.map((item, idx) => {
          const isMissing = missingIndices.includes(idx);
          const isPlaced = placed[idx];
          if (isMissing && !isPlaced) {
            return (
              <TouchableOpacity
                key={`slot-${idx}`}
                style={[styles.slot, selectedTileId !== null && styles.slotActive]}
                onPress={() => handleSlotPress(idx)}
                activeOpacity={0.7}
              >
                <Text style={styles.slotText}>?</Text>
              </TouchableOpacity>
            );
          }
          return (
            <View key={item.id} style={styles.patternItem}>
              <PatternItemComponent item={item} size={50} />
            </View>
          );
        })}
      </View>

      <View style={styles.tilesContainer}>
        {tiles.map(
          tile =>
            !tile.used && (
              <TouchableOpacity
                key={tile.id}
                style={[
                  styles.tile,
                  selectedTileId === tile.id && styles.tileSelected,
                ]}
                onPress={() => handleTilePress(tile.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.tileText}>{tile.value}</Text>
              </TouchableOpacity>
            )
        )}
      </View>

      {selectedTileId !== null && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSelection}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}

      {errorMessage && (
        <View style={styles.localError}>
          <Text style={styles.localErrorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
};

// ==================== Main Screen Component ====================
function PatternPathScreenContent({ navigation }: any) {
  const [currentActivity, setCurrentActivity] = useState<ActivityId>(ACTIVITIES.BEAD_PATTERN);
  const [completedActivities, setCompletedActivities] = useState<Record<ActivityId, boolean>>({} as any);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [completionVisible, setCompletionVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { level, adjustDifficulty } = useAdaptiveDifficulty('patternPath');
  const messageTimeout = useRef<NodeJS.Timeout | null>(null);
  const confettiRef = useRef<LottieView>(null);

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
      setScore(prev => prev + 1);
      showTemporaryMessage('Great job!', 'success');
      setCompletedActivities(prev => ({
        ...prev,
        [currentActivity]: true,
      }));
      if (currentActivity < ACTIVITIES.PATTERN_FILL) {
        setTimeout(() => setCurrentActivity((currentActivity + 1) as ActivityId), 1500);
      } else {
        setShowConfetti(true);
        confettiRef.current?.play();
        setTimeout(() => setCompletionVisible(true), 2000);
      }
    } else {
      showTemporaryMessage('Try again!', 'error');
    }
  };

  const handlePlayAgain = () => {
    setCurrentActivity(ACTIVITIES.BEAD_PATTERN);
    setCompletedActivities({});
    setScore(0);
    setCompletionVisible(false);
    setShowConfetti(false);
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
        case ACTIVITIES.BEAD_PATTERN:
          return <BeadPattern {...commonProps} />;
        case ACTIVITIES.SHAPE_PATTERN:
          return <ShapePattern {...commonProps} />;
        case ACTIVITIES.COLOR_PATTERN:
          return <ColorPattern {...commonProps} />;
        case ACTIVITIES.SIZE_PATTERN:
          return <SizePattern {...commonProps} />;
        case ACTIVITIES.PATTERN_FILL:
          return <PatternFill {...commonProps} />;
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
    <LinearGradient colors={['#FFD1DC', '#B5EAD7', '#C7CEEA']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoHome} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pattern Path</Text>
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

        {message && (
          <View style={[styles.floatingMessage, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
            <Text style={styles.floatingText}>{message.text}</Text>
          </View>
        )}

        {showConfetti && (
          <LottieView
            ref={confettiRef}
            source={require('../../assets/animations/confetti.json')}
            autoPlay
            loop={false}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}

        <Modal visible={completionVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Great work!</Text>
              <Text style={styles.modalSubtitle}>You completed the Pattern Path</Text>
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
    </LinearGradient>
  );
}

export default function PatternPathScreen(props: any) {
  return (
    <ErrorBoundary>
      <PatternPathScreenContent {...props} />
    </ErrorBoundary>
  );
}

// ==================== Enhanced Styles ====================
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    width: 50,
    alignItems: 'center',
  },
  backText: { fontSize: 32, color: '#333' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreBadge: {
    backgroundColor: '#FFD93D',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scoreText: { color: '#333', fontWeight: 'bold', fontSize: 20 },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 30,
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
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: { backgroundColor: '#4CAF50' },
  mainContent: { flex: 1, padding: 20 },
  activityContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patternRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 30 },
  patternItem: { margin: 8 },
  missingSlot: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FF9800',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  missingText: { fontSize: 24, color: '#FF9800', fontWeight: 'bold' },
  hintSlot: {
    backgroundColor: 'rgba(255,152,0,0.3)',
    borderColor: '#4CAF50',
  },
  hintText: { fontSize: 24, color: '#4CAF50', fontWeight: 'bold' },
  optionsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  optionButton: {
    backgroundColor: '#FFB74D',
    padding: 20,
    margin: 10,
    borderRadius: 40,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  optionSelected: { backgroundColor: '#4CAF50', transform: [{ scale: 1.1 }] },
  optionText: { fontSize: 28, color: 'white', fontWeight: 'bold' },
  sizeOption: { padding: 15 },
  hintButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 40,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  hintButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  slot: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 15,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF9800',
    borderStyle: 'dashed',
  },
  slotText: { fontSize: 20, color: '#FF9800', fontWeight: 'bold' },
  slotActive: {
    borderColor: '#4CAF50',
    borderWidth: 4,
    transform: [{ scale: 1.05 }],
  },
  tilesContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  tile: {
    width: 70,
    height: 70,
    backgroundColor: '#FFB74D',
    borderRadius: 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  tileText: { fontSize: 28, color: 'white', fontWeight: 'bold' },
  tileSelected: {
    backgroundColor: '#4CAF50',
    transform: [{ scale: 1.1 }],
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  localError: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  localErrorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  successMessage: { backgroundColor: '#4CAF50' },
  errorMessage: { backgroundColor: '#F44336' },
  floatingText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalTitle: { fontSize: 36, fontWeight: 'bold', color: '#FF9800', marginBottom: 10 },
  modalSubtitle: { fontSize: 18, color: '#666', marginBottom: 20 },
  modalScore: { alignItems: 'center', marginBottom: 30 },
  modalScoreLabel: { fontSize: 16, color: '#999' },
  modalScoreValue: { fontSize: 56, fontWeight: 'bold', color: '#FFB74D' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    minWidth: 110,
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  homeButton: { backgroundColor: '#8D6E63' },
  playAgainButton: { backgroundColor: '#FF9800' },
  modalButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});