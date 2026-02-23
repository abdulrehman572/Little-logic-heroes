// src/screens/PuzzlePeakScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  JIGSAW: 1,              // 2-4 piece puzzle (tap to place)
  TANGRAM: 2,             // match shape with tangram pieces
  PATTERN_BLOCKS: 3,      // fill outline with blocks (tap to place)
  SLIDE_PUZZLE: 4,        // 3x3 slide puzzle
  ROTATING_PIECES: 5,     // rotate pieces to fit
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
    // Placeholder
  };

  return { level, adjustDifficulty };
};

// ==================== Helper: generate jigsaw pieces ====================
const generateJigsawPieces = (level: number) => {
  const pieceCount = level === 1 ? 2 : level === 2 ? 3 : 4;
  const imageParts = ['🌞', '🌙', '⭐', '☁️']; // emoji pieces
  const shuffled = [...imageParts.slice(0, pieceCount)].sort(() => 0.5 - Math.random());
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    originalIndex: index,
  }));
};

// ==================== Activity 1: Jigsaw Puzzle (Tap to Place) ====================
const JigsawPuzzle = ({ level, onItemTap, onComplete }: any) => {
  const [pieces, setPieces] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const newPieces = generateJigsawPieces(level);
    setPieces(newPieces);
    setSlots(newPieces.map((p, idx) => ({ id: idx, emoji: p.emoji })));
    setPlaced({});
    setSelectedPieceId(null);
    startTime.current = Date.now();
  }, [level]);

  const handlePiecePress = (id: number) => {
    if (placed[id]) return;
    AudioManager.playSound('count');
    setSelectedPieceId(id);
  };

  const handleSlotPress = (slotId: number) => {
    if (selectedPieceId === null) return;

    const piece = pieces.find(p => p.id === selectedPieceId);
    const slot = slots[slotId];

    // Check if the piece belongs to this slot
    const correct = piece && piece.originalIndex === slotId;

    if (correct) {
      AudioManager.playSound('success');
      setPlaced(prev => ({ ...prev, [selectedPieceId]: true }));
      setSelectedPieceId(null);
      onItemTap();

      if (Object.keys(placed).length + 1 === pieces.length) {
        onComplete(true, Date.now() - startTime.current);
      }
    } else {
      AudioManager.playSound('gentleError');
      setSelectedPieceId(null);
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Tap a piece, then tap its matching slot</Text>

      {/* Slots (top) */}
      <View style={styles.jigsawSlots}>
        {slots.map((slot, idx) => (
          <TouchableOpacity
            key={slot.id}
            style={styles.jigsawSlot}
            onPress={() => handleSlotPress(idx)}
          >
            {placed[pieces.find(p => p.originalIndex === idx)?.id] ? (
              <Text style={styles.jigsawSlotEmoji}>{slot.emoji}</Text>
            ) : (
              <Text style={styles.jigsawSlotEmpty}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Pieces (bottom) */}
      <View style={styles.jigsawPieces}>
        {pieces.map(piece => {
          if (placed[piece.id]) return null;
          const isSelected = selectedPieceId === piece.id;
          return (
            <TouchableOpacity
              key={piece.id}
              style={[styles.jigsawPiece, isSelected && styles.jigsawPieceSelected]}
              onPress={() => handlePiecePress(piece.id)}
            >
              <Text style={styles.jigsawPieceEmoji}>{piece.emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ==================== Activity 2: Tangram Shapes ====================
const Tangram = ({ level, onItemTap, onComplete }: any) => {
  const [targetShape, setTargetShape] = useState<string>('');
  const [pieces, setPieces] = useState<any[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const shapes = ['🐶', '🐱', '🐭', '🐸']; // target shapes
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    setTargetShape(shape);
    // Generate tangram pieces (simplified as colored blocks)
    const numPieces = level === 1 ? 3 : level === 2 ? 4 : 5;
    const newPieces = Array.from({ length: numPieces }, (_, i) => ({
      id: i,
      color: `hsl(${i * 60}, 70%, 60%)`,
      shape: ['▲', '■', '●'][i % 3],
    }));
    setPieces(newPieces);
    setSelectedPiece(null);
    startTime.current = Date.now();
  }, [level]);

  const handlePiecePress = (id: number) => {
    setSelectedPiece(id);
    // For demo, consider correct if piece shape matches something (simplified)
    const correct = id === 0; // placeholder
    onItemTap();
    onComplete(correct, Date.now() - startTime.current);
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Arrange the tangram to form</Text>
      <View style={styles.targetShape}>
        <Text style={styles.targetEmoji}>{targetShape}</Text>
      </View>
      <View style={styles.tangramPieces}>
        {pieces.map(piece => (
          <TouchableOpacity
            key={piece.id}
            style={[styles.tangramPiece, { backgroundColor: piece.color }, selectedPiece === piece.id && styles.tangramSelected]}
            onPress={() => handlePiecePress(piece.id)}
          >
            <Text style={styles.tangramPieceText}>{piece.shape}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 3: Pattern Blocks (Tap to Place) ====================
const PatternBlocks = ({ level, onItemTap, onComplete }: any) => {
  const [outline, setOutline] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [placedBlocks, setPlacedBlocks] = useState<Record<number, boolean>>({});
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const numSlots = level === 1 ? 2 : level === 2 ? 3 : 4;
    const newOutline = Array.from({ length: numSlots }, (_, i) => ({ id: i, color: '#CCC' }));
    setOutline(newOutline);
    const newBlocks = newOutline.map((_, i) => ({ id: i, color: `hsl(${i * 90}, 70%, 60%)` }));
    setBlocks(newBlocks);
    setPlacedBlocks({});
    setSelectedBlockId(null);
    startTime.current = Date.now();
  }, [level]);

  const handleBlockPress = (id: number) => {
    if (placedBlocks[id]) return;
    AudioManager.playSound('count');
    setSelectedBlockId(id);
  };

  const handleOutlinePress = (slotId: number) => {
    if (selectedBlockId === null) return;

    const correct = selectedBlockId === slotId; // block should go to its own slot

    if (correct) {
      AudioManager.playSound('success');
      setPlacedBlocks(prev => ({ ...prev, [selectedBlockId]: true }));
      setSelectedBlockId(null);
      onItemTap();

      if (Object.keys(placedBlocks).length + 1 === blocks.length) {
        onComplete(true, Date.now() - startTime.current);
      }
    } else {
      AudioManager.playSound('gentleError');
      setSelectedBlockId(null);
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Tap a block, then tap its matching outline</Text>

      {/* Outlines (top) */}
      <View style={styles.outlineRow}>
        {outline.map(slot => (
          <TouchableOpacity
            key={slot.id}
            style={[styles.outlineSlot, { backgroundColor: slot.color }]}
            onPress={() => handleOutlinePress(slot.id)}
          >
            {placedBlocks[slot.id] ? (
              <View style={[styles.block, { backgroundColor: blocks[slot.id].color }]} />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      {/* Blocks (bottom) */}
      <View style={styles.blocksRow}>
        {blocks.map(block => {
          if (placedBlocks[block.id]) return null;
          const isSelected = selectedBlockId === block.id;
          return (
            <TouchableOpacity
              key={block.id}
              style={[styles.block, { backgroundColor: block.color }, isSelected && styles.blockSelected]}
              onPress={() => handleBlockPress(block.id)}
            />
          );
        })}
      </View>
    </View>
  );
};

// ==================== Activity 4: Slide Puzzle ====================
const SlidePuzzle = ({ level, onItemTap, onComplete }: any) => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(-1);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const size = level === 1 ? 2 : level === 2 ? 3 : 3; // 2x2 or 3x3
    const total = size * size;
    const initial = Array.from({ length: total - 1 }, (_, i) => i + 1);
    initial.push(0); // 0 represents empty
    // Shuffle
    for (let i = initial.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initial[i], initial[j]] = [initial[j], initial[i]];
    }
    setTiles(initial);
    setEmptyIndex(initial.indexOf(0));
    startTime.current = Date.now();
  }, [level]);

  const handleTilePress = (index: number) => {
    // Check if adjacent to empty
    const size = level === 1 ? 2 : 3;
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) || (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
      // Swap
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setEmptyIndex(index);
      onItemTap();

      // Check win condition
      const solved = newTiles.every((val, idx) => val === (idx + 1) % (size * size));
      if (solved) {
        onComplete(true, Date.now() - startTime.current);
      }
    }
  };

  const size = level === 1 ? 2 : 3;
  const tileSize = 80;

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Slide the tiles to order them</Text>
      <View style={[styles.slideGrid, { width: size * tileSize, height: size * tileSize }]}>
        {tiles.map((val, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.slideTile,
              { width: tileSize - 5, height: tileSize - 5, left: (idx % size) * tileSize, top: Math.floor(idx / size) * tileSize },
              val === 0 && styles.slideTileEmpty,
            ]}
            onPress={() => handleTilePress(idx)}
            disabled={val === 0}
          >
            {val !== 0 && <Text style={styles.slideTileText}>{val}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Activity 5: Rotating Pieces ====================
const RotatingPieces = ({ level, onItemTap, onComplete }: any) => {
  const [pieces, setPieces] = useState<any[]>([]);
  const [rotations, setRotations] = useState<number[]>([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const numPieces = level === 1 ? 2 : level === 2 ? 3 : 4;
    const newPieces = Array.from({ length: numPieces }, (_, i) => ({
      id: i,
      shape: ['▲', '■', '●'][i % 3],
      color: `hsl(${i * 90}, 70%, 60%)`,
    }));
    setPieces(newPieces);
    setRotations(new Array(numPieces).fill(0));
    startTime.current = Date.now();
  }, [level]);

  const rotatePiece = (id: number) => {
    setRotations(prev => {
      const newRot = [...prev];
      newRot[id] = (newRot[id] + 90) % 360;
      return newRot;
    });
    onItemTap();
    // Check if all pieces are at correct rotation (for demo, correct if rotation % 180 === 0)
    const allCorrect = rotations.every((rot, idx) => rot % 180 === 0);
    if (allCorrect) {
      onComplete(true, Date.now() - startTime.current);
    }
  };

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.instruction}>Tap to rotate each piece to the correct orientation</Text>
      <View style={styles.rotateRow}>
        {pieces.map((piece, idx) => (
          <TouchableOpacity
            key={piece.id}
            style={[styles.rotatePiece, { backgroundColor: piece.color, transform: [{ rotate: `${rotations[idx]}deg` }] }]}
            onPress={() => rotatePiece(idx)}
          >
            <Text style={styles.rotateText}>{piece.shape}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== Main Screen Component ====================
function PuzzlePeakScreenContent({ navigation }: any) {
  const [currentActivity, setCurrentActivity] = useState<ActivityId>(ACTIVITIES.JIGSAW);
  const [completedActivities, setCompletedActivities] = useState<Record<ActivityId, boolean>>({} as any);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [completionVisible, setCompletionVisible] = useState(false);
  const { level, adjustDifficulty } = useAdaptiveDifficulty('puzzlePeak');
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
      if (currentActivity < ACTIVITIES.ROTATING_PIECES) {
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
    setCurrentActivity(ACTIVITIES.JIGSAW);
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
        case ACTIVITIES.JIGSAW:
          return <JigsawPuzzle {...commonProps} />;
        case ACTIVITIES.TANGRAM:
          return <Tangram {...commonProps} />;
        case ACTIVITIES.PATTERN_BLOCKS:
          return <PatternBlocks {...commonProps} />;
        case ACTIVITIES.SLIDE_PUZZLE:
          return <SlidePuzzle {...commonProps} />;
        case ACTIVITIES.ROTATING_PIECES:
          return <RotatingPieces {...commonProps} />;
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
        <Text style={styles.title}>Puzzle Peak</Text>
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
            <Text style={styles.modalSubtitle}>You completed Puzzle Peak</Text>
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

export default function PuzzlePeakScreen(props: any) {
  return (
    <ErrorBoundary>
      <PuzzlePeakScreenContent {...props} />
    </ErrorBoundary>
  );
}

// ==================== Styles ====================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF8E1' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FF9800',
  },
  backButton: { padding: 10 },
  backText: { fontSize: 32, color: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  scoreBadge: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#FF9800',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressDotCompleted: { backgroundColor: '#4CAF50' },
  scrollContent: { flexGrow: 1, padding: 20 },
  activityContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: { fontSize: 24, color: '#333', marginBottom: 20, textAlign: 'center', paddingHorizontal: 10 },
  // Jigsaw (tap)
  jigsawSlots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  jigsawSlot: {
    width: 70,
    height: 70,
    backgroundColor: '#FFB74D',
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jigsawSlotEmoji: { fontSize: 40 },
  jigsawSlotEmpty: { fontSize: 30, color: '#666' },
  jigsawPieces: { flexDirection: 'row', justifyContent: 'center' },
  jigsawPiece: {
    width: 70,
    height: 70,
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF9800', // visible container
  },
  jigsawPieceSelected: { borderWidth: 4, borderColor: '#4CAF50' },
  jigsawPieceEmoji: { fontSize: 40 },
  // Tangram
  targetShape: { marginBottom: 20 },
  targetEmoji: { fontSize: 80 },
  tangramPieces: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  tangramPiece: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tangramSelected: { borderWidth: 4, borderColor: '#FFF' },
  tangramPieceText: { fontSize: 30, color: 'white' },
  // Pattern Blocks (tap)
  outlineRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  outlineSlot: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blocksRow: { flexDirection: 'row', justifyContent: 'center' },
  block: {
    width: 70,
    height: 70,
    margin: 5,
    borderRadius: 10,
    elevation: 5,
  },
  blockSelected: { borderWidth: 4, borderColor: '#4CAF50' },
  // Slide Puzzle
  slideGrid: { position: 'relative', marginTop: 20 },
  slideTile: {
    position: 'absolute',
    backgroundColor: '#FFB74D',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTileEmpty: { backgroundColor: 'transparent' },
  slideTileText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  // Rotating Pieces
  rotateRow: { flexDirection: 'row', justifyContent: 'center' },
  rotatePiece: {
    width: 80,
    height: 80,
    margin: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotateText: { fontSize: 30, color: 'white' },
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
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: '#FF9800', marginBottom: 10 },
  modalSubtitle: { fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' },
  modalScore: { alignItems: 'center', marginBottom: 30 },
  modalScoreLabel: { fontSize: 16, color: '#999' },
  modalScoreValue: { fontSize: 48, fontWeight: 'bold', color: '#FFB74D' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  modalButton: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, minWidth: 120, alignItems: 'center' },
  homeButton: { backgroundColor: '#8D6E63' },
  playAgainButton: { backgroundColor: '#FF9800' },
  modalButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});