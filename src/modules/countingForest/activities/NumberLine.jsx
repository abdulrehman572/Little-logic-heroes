// src/modules/countingForest/activities/NumberLine.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { forestTheme } from '../../../constants/theme';

const { width } = Dimensions.get('window');

// Helper to generate a shuffled array of numbers
const generateNumberLine = (level) => {
  const count = level === 1 ? 5 : level === 2 ? 10 : 20;
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  // Shuffle and pick first 3 as missing spots
  const shuffled = [...numbers].sort(() => 0.5 - Math.random());
  const missingPositions = shuffled.slice(0, 3).sort((a, b) => a - b); // keep sorted
  return { numbers, missingPositions };
};

export default function NumberLine({ level = 1, onComplete }) {
  const [data, setData] = useState(() => generateNumberLine(level));
  const [placedNumbers, setPlacedNumbers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const dropZones = useRef({}).current;
  const startTime = useRef(Date.now());

  // Create draggable number tiles for missing numbers
  const [tiles] = useState(() => {
    return data.missingPositions.map((num) => ({
      id: num,
      value: num,
      pan: new Animated.ValueXY(),
    }));
  });

  // PanResponder for each tile
  const createPanResponder = (tile) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: tile.pan.x, dy: tile.pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        // Check if dropped on correct drop zone
        const dropZoneKey = `zone_${tile.value}`;
        const zone = dropZones[dropZoneKey];
        if (zone && isInDropZone(gesture, zone)) {
          // Correct placement
          Animated.spring(tile.pan, {
            toValue: { x: zone.x - tile.initialX, y: zone.y - tile.initialY },
            useNativeDriver: true,
          }).start();
          setPlacedNumbers((prev) => ({ ...prev, [tile.value]: true }));
          setScore((prev) => prev + 1);
          playSuccess();
        } else {
          // Return to original position
          Animated.spring(tile.pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  };

  // Helper to check if gesture ended inside zone
  const isInDropZone = (gesture, zone) => {
    return (
      gesture.moveX > zone.x &&
      gesture.moveX < zone.x + zone.width &&
      gesture.moveY > zone.y &&
      gesture.moveY < zone.y + zone.height
    );
  };

  // Play success sound & animation
  const playSuccess = async () => {
    setFeedback('success');
    // You can integrate AudioManager.play('success') here
    setTimeout(() => setFeedback(null), 1000);
  };

  // When all numbers placed, complete activity
  useEffect(() => {
    if (score === data.missingPositions.length && score > 0) {
      const timeTaken = Date.now() - startTime.current;
      onComplete(true, timeTaken);
    }
  }, [score]);

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Drag the numbers to the right spots on the line!</Text>

      {/* Number line */}
      <View style={styles.numberLine}>
        {data.numbers.map((num) => {
          const isMissing = data.missingPositions.includes(num);
          const isPlaced = placedNumbers[num];
          if (isMissing && !isPlaced) {
            // Empty slot with drop zone
            return (
              <View
                key={`slot_${num}`}
                style={styles.slot}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  dropZones[`zone_${num}`] = {
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
          } else {
            // Display number
            return (
              <View key={`num_${num}`} style={styles.numberBox}>
                <Text style={styles.numberText}>{num}</Text>
              </View>
            );
          }
        })}
      </View>

      {/* Draggable tiles */}
      <View style={styles.tilesContainer}>
        {tiles.map((tile) => {
          if (placedNumbers[tile.value]) return null; // already placed
          return (
            <Animated.View
              key={tile.id}
              style={[
                tile.pan.getLayout(),
                styles.tile,
              ]}
              {...createPanResponder(tile).panHandlers}
              onLayout={(event) => {
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

      {/* Feedback animation */}
      {feedback === 'success' && (
        <LottieView
          source={require('../assets/animations/star.json')}
          autoPlay
          loop={false}
          style={styles.feedback}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: forestTheme.colors.background, padding: 20 },
  instruction: { fontSize: 24, color: forestTheme.colors.primary, textAlign: 'center', marginBottom: 30 },
  numberLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: forestTheme.colors.secondary + '30',
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
  },
  numberBox: {
    width: 50,
    height: 50,
    backgroundColor: forestTheme.colors.primary,
    borderRadius: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  slot: {
    width: 50,
    height: 50,
    backgroundColor: forestTheme.colors.accent + '80',
    borderRadius: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: forestTheme.colors.primary,
    borderStyle: 'dashed',
  },
  slotText: { fontSize: 24, color: forestTheme.colors.primary, fontWeight: 'bold' },
  tilesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  tile: {
    width: 60,
    height: 60,
    backgroundColor: forestTheme.colors.secondary,
    borderRadius: 15,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  tileText: { fontSize: 28, color: 'white', fontWeight: 'bold' },
  feedback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});