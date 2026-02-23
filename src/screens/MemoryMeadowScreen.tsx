// src/screens/MemoryMeadowScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
  ScrollView,
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
  MATCH_PAIRS: 1,          // classic memory match
  REMEMBER_SEQUENCE: 2,    // tap in the same order
  WHICH_MISSING: 3,        // which item disappeared?
  SOUND_MEMORY: 4,         // remember and match sounds
  PATTERN_RECALL: 5,       // repeat a visual pattern
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
      // Add more sounds if needed
    };
    for (const [key, source] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source);
        this.sounds[key] = sound;
      } catch (e) {
        // ignore
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
    // Placeholder – can be expanded later
  };

  return { level, adjustDifficulty };
};

// ==================== Activity 1: Match Pairs ====================
const MatchPairs = ({ level, onItemTap, onComplete }: any) => {
  const [cards, setCards] = useState<any[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [canFlip, setCanFlip] = useState(true);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Generate pairs of emojis
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];
    const numPairs = level === 1 ? 3 : level === 2 ? 4 : 6;
    const selected = emojis.slice(0, numPairs);
    let deck = [...selected, ...selected]
      .sort(() => 0.5 - Math.random())
      .map((emoji, index) => ({ id: index, emoji, matched: false }));
    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairs([]);
    startTime.current = Date.now();
  }, [level]);

  const handleCardPress = (index: number) => {
    if (!canFlip) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairs.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      const [first, second] = newFlipped;
      const match = cards[first].emoji === cards[second].emoji;

      if (match) {
        AudioManager.playSound('count');
        setMatchedPairs(prev => [...prev, first, second]);
        setFlippedIndices([]);
        setCanFlip(true);

        if (matchedPairs.length + 2 === cards.length) {
          onItemTap();
          onComplete(true, Date.now() - startTime.current);
        }
      } else {
        AudioManager.playSound('gentleError');
        setTimeout(() => {
          setFlippedIndices([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Find the matching pairs</Text>
      <View style={styles.grid}>
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedPairs.includes(idx);
          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, isFlipped ? styles.cardFlipped : {}]}
              onPress={() => handleCardPress(idx)}
              disabled={!canFlip || matchedPairs.includes(idx)}
            >
              <Text style={styles.cardEmoji}>{isFlipped ? card.emoji : '❓'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ==================== Activity 2: Remember Sequence ====================
const RememberSequence = ({ level, onItemTap, onComplete }: any) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Generate a random sequence of button indices
    const length = level === 1 ? 3 : level === 2 ? 4 : 5;
    const newSeq = Array.from({ length }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserSequence([]);
    setShowing(true);
    startTime.current = Date.now();

    // Play the sequence
    let i = 0;
    const interval = setInterval(() => {
      if (i < newSeq.length) {
        setHighlightedIndex(newSeq[i]);
        setTimeout(() => setHighlightedIndex(-1), 300);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowing(false), 500);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [level]);

  const handleButtonPress = (idx: number) => {
    if (showing) return;
    const newUser = [...userSequence, idx];
    setUserSequence(newUser);
    AudioManager.playSound('count');

    // Check if correct so far
    const correctSoFar = newUser.every((val, pos) => val === sequence[pos]);
    if (!correctSoFar) {
      onItemTap();
      onComplete(false, Date.now() - startTime.current);
      return;
    }

    if (newUser.length === sequence.length) {
      onItemTap();
      onComplete(true, Date.now() - startTime.current);
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>
        {showing ? 'Watch the sequence...' : 'Repeat the sequence'}
      </Text>
      <View style={styles.buttonGrid}>
        {[0, 1, 2, 3].map(idx => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.seqButton,
              { backgroundColor: idx === 0 ? '#FF6B6B' : idx === 1 ? '#4ECDC4' : idx === 2 ? '#FFB74D' : '#9C27B0' },
              highlightedIndex === idx && styles.seqButtonHighlighted,
            ]}
            onPress={() => handleButtonPress(idx)}
            disabled={showing}
          />
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 3: Which One Was Missing? ====================
const WhichMissing = ({ level, onItemTap, onComplete }: any) => {
  const [items, setItems] = useState<string[]>([]);
  const [hiddenIndex, setHiddenIndex] = useState(-1);
  const [showAll, setShowAll] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const count = level === 1 ? 4 : level === 2 ? 5 : 6;
    const selected = emojis.slice(0, count).sort(() => 0.5 - Math.random());
    setItems(selected);
    const missingIdx = Math.floor(Math.random() * count);
    setHiddenIndex(missingIdx);
    setShowAll(true);
    startTime.current = Date.now();

    // Hide one after 2 seconds
    const timer = setTimeout(() => {
      setShowAll(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [level]);

  useEffect(() => {
    if (!showAll) {
      // Generate options: the missing one plus two distractors
      const missing = items[hiddenIndex];
      const others = items.filter((_, i) => i !== hiddenIndex);
      const distractor1 = others[Math.floor(Math.random() * others.length)];
      let distractor2 = others[Math.floor(Math.random() * others.length)];
      while (distractor2 === distractor1) {
        distractor2 = others[Math.floor(Math.random() * others.length)];
      }
      setOptions([missing, distractor1, distractor2].sort(() => 0.5 - Math.random()));
    }
  }, [showAll]);

  const handleOptionPress = (emoji: string) => {
    const correct = emoji === items[hiddenIndex];
    onItemTap();
    onComplete(correct, Date.now() - startTime.current);
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>
        {showAll ? 'Memorize these items...' : 'Which one was missing?'}
      </Text>
      <View style={styles.itemsRow}>
        {items.map((emoji, idx) => (
          <View key={idx} style={styles.missingItem}>
            <Text style={styles.missingEmoji}>{showAll ? emoji : idx === hiddenIndex ? '❓' : emoji}</Text>
          </View>
        ))}
      </View>
      {!showAll && (
        <View style={styles.optionsRow}>
          {options.map((opt, i) => (
            <TouchableOpacity key={i} style={styles.optionButton} onPress={() => handleOptionPress(opt)}>
              <Text style={styles.optionEmoji}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ==================== Activity 4: Sound Memory ====================
const SoundMemory = ({ level, onItemTap, onComplete }: any) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  // Available sounds (we'll simulate with text for now)
  const sounds = ['🐶', '🐱', '🐭', '🐸']; // emoji as placeholders

  useEffect(() => {
    // Generate random sound sequence
    const length = level === 1 ? 2 : level === 2 ? 3 : 4;
    const newSeq = Array.from({ length }, () => sounds[Math.floor(Math.random() * sounds.length)]);
    setSequence(newSeq);
    setUserSequence([]);
    setIsPlaying(true);
    startTime.current = Date.now();

    // Play sequence
    let i = 0;
    const interval = setInterval(() => {
      if (i < newSeq.length) {
        setCurrentSound(newSeq[i]);
        AudioManager.playSound('count'); // placeholder sound
        setTimeout(() => setCurrentSound(null), 400);
        i++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [level]);

  const handleSoundPress = (sound: string) => {
    if (isPlaying) return;
    const newUser = [...userSequence, sound];
    setUserSequence(newUser);
    AudioManager.playSound('count');

    const correctSoFar = newUser.every((val, idx) => val === sequence[idx]);
    if (!correctSoFar) {
      onItemTap();
      onComplete(false, Date.now() - startTime.current);
      return;
    }

    if (newUser.length === sequence.length) {
      onItemTap();
      onComplete(true, Date.now() - startTime.current);
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>
        {isPlaying ? 'Listen to the sounds...' : 'Repeat the sounds in order'}
      </Text>
      <View style={styles.soundGrid}>
        {sounds.map((sound, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.soundButton, currentSound === sound && styles.soundButtonActive]}
            onPress={() => handleSoundPress(sound)}
            disabled={isPlaying}
          >
            <Text style={styles.soundEmoji}>{sound}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 5: Pattern Recall ====================
const PatternRecall = ({ level, onItemTap, onComplete }: any) => {
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [pattern, setPattern] = useState<number[][]>([]); // list of [row, col]
  const [userPattern, setUserPattern] = useState<number[][]>([]);
  const [showing, setShowing] = useState(true);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const size = level === 1 ? 2 : level === 2 ? 3 : 4;
    const emptyGrid = Array(size).fill(false).map(() => Array(size).fill(false));
    setGrid(emptyGrid);

    // Generate random pattern (2 cells for level 1, 3 for level 2, 4 for level 3)
    const numCells = level === 1 ? 2 : level === 2 ? 3 : 4;
    const newPattern: number[][] = [];
    while (newPattern.length < numCells) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!newPattern.some(([pr, pc]) => pr === r && pc === c)) {
        newPattern.push([r, c]);
      }
    }
    setPattern(newPattern);
    setUserPattern([]);
    setShowing(true);
    startTime.current = Date.now();

    // Show pattern for 2 seconds
    const timer = setTimeout(() => {
      setShowing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [level]);

  const handleCellPress = (r: number, c: number) => {
    if (showing) return;
    if (userPattern.some(([ur, uc]) => ur === r && uc === c)) return; // already tapped

    const newUser = [...userPattern, [r, c]];
    setUserPattern(newUser);
    AudioManager.playSound('count');

    // Check correctness
    const correctSoFar = newUser.every(([ur, uc], idx) => {
      const [pr, pc] = pattern[idx];
      return ur === pr && uc === pc;
    });

    if (!correctSoFar) {
      onItemTap();
      onComplete(false, Date.now() - startTime.current);
      return;
    }

    if (newUser.length === pattern.length) {
      onItemTap();
      onComplete(true, Date.now() - startTime.current);
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>
        {showing ? 'Memorize the pattern...' : 'Tap the cells in the same pattern'}
      </Text>
      <View style={styles.patternGrid}>
        {grid.map((row, r) => (
          <View key={r} style={styles.patternRow}>
            {row.map((_, c) => {
              const isPattern = showing && pattern.some(([pr, pc]) => pr === r && pc === c);
              const isUser = !showing && userPattern.some(([ur, uc]) => ur === r && uc === c);
              const isCorrectPattern = pattern.some(([pr, pc]) => pr === r && pc === c);
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.patternCell,
                    isPattern && styles.patternCellActive,
                    isUser && (isCorrectPattern ? styles.patternCellCorrect : styles.patternCellIncorrect),
                  ]}
                  onPress={() => handleCellPress(r, c)}
                  disabled={showing}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

// ==================== Main Screen Component ====================
function MemoryMeadowScreenContent({ navigation }: any) {
  const [currentActivity, setCurrentActivity] = useState<ActivityId>(ACTIVITIES.MATCH_PAIRS);
  const [completedActivities, setCompletedActivities] = useState<Record<ActivityId, boolean>>({} as any);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [completionVisible, setCompletionVisible] = useState(false);
  const { level, adjustDifficulty } = useAdaptiveDifficulty('memoryMeadow');
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
      if (currentActivity < ACTIVITIES.PATTERN_RECALL) {
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
    setCurrentActivity(ACTIVITIES.MATCH_PAIRS);
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
        case ACTIVITIES.MATCH_PAIRS:
          return <MatchPairs {...commonProps} />;
        case ACTIVITIES.REMEMBER_SEQUENCE:
          return <RememberSequence {...commonProps} />;
        case ACTIVITIES.WHICH_MISSING:
          return <WhichMissing {...commonProps} />;
        case ACTIVITIES.SOUND_MEMORY:
          return <SoundMemory {...commonProps} />;
        case ACTIVITIES.PATTERN_RECALL:
          return <PatternRecall {...commonProps} />;
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
        <Text style={styles.title}>Memory Meadow</Text>
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderActivity()}
      </ScrollView>

      {message && (
        <View style={[styles.floatingMessage, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
          <Text style={styles.floatingText}>{message.text}</Text>
        </View>
      )}

      <Modal visible={completionVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Great work!</Text>
            <Text style={styles.modalSubtitle}>You completed Memory Meadow</Text>
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

export default function MemoryMeadowScreen(props: any) {
  return (
    <ErrorBoundary>
      <MemoryMeadowScreenContent {...props} />
    </ErrorBoundary>
  );
}

// ==================== Styles ====================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3E5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#7B1FA2',
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
    backgroundColor: '#7B1FA2',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressDotCompleted: { backgroundColor: '#4CAF50' },
  scrollContent: { flexGrow: 1, padding: 20 },
  activityContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: { fontSize: 24, color: '#333', marginBottom: 20, textAlign: 'center', paddingHorizontal: 10 },
  // MatchPairs
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 300 },
  card: {
    width: 70,
    height: 70,
    backgroundColor: '#BA68C8',
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFlipped: { backgroundColor: '#FFB74D' },
  cardEmoji: { fontSize: 40 },
  // RememberSequence
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 200 },
  seqButton: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 40,
  },
  seqButtonHighlighted: { borderWidth: 5, borderColor: '#FFF' },
  // WhichMissing
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  missingItem: { margin: 10 },
  missingEmoji: { fontSize: 50 },
  optionsRow: { flexDirection: 'row', justifyContent: 'center' },
  optionButton: {
    backgroundColor: '#BA68C8',
    padding: 20,
    margin: 10,
    borderRadius: 40,
    minWidth: 80,
    alignItems: 'center',
  },
  optionEmoji: { fontSize: 40 },
  // SoundMemory
  soundGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  soundButton: {
    width: 80,
    height: 80,
    backgroundColor: '#BA68C8',
    margin: 10,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundButtonActive: { backgroundColor: '#FFB74D' },
  soundEmoji: { fontSize: 40 },
  // PatternRecall
  patternGrid: { marginTop: 20 },
  patternRow: { flexDirection: 'row' },
  patternCell: {
    width: 60,
    height: 60,
    backgroundColor: '#E0E0E0',
    margin: 5,
    borderRadius: 10,
  },
  patternCellActive: { backgroundColor: '#7B1FA2' },
  patternCellCorrect: { backgroundColor: '#4CAF50' },
  patternCellIncorrect: { backgroundColor: '#F44336' },
  // Floating message
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
  // Modal
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
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: '#7B1FA2', marginBottom: 10 },
  modalSubtitle: { fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' },
  modalScore: { alignItems: 'center', marginBottom: 30 },
  modalScoreLabel: { fontSize: 16, color: '#999' },
  modalScoreValue: { fontSize: 48, fontWeight: 'bold', color: '#FFB74D' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  modalButton: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, minWidth: 120, alignItems: 'center' },
  homeButton: { backgroundColor: '#8D6E63' },
  playAgainButton: { backgroundColor: '#7B1FA2' },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});