import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

interface DropZoneProps {
  id: string;
  type: 'circle' | 'square' | 'triangle';
  color: string;
  x: number;
  y: number;
  isActive: boolean;
  isCorrect?: boolean;
  showHint?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  id,
  type,
  color,
  x,
  y,
  isActive,
  isCorrect,
  showHint,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: withSpring(isActive ? 1.1 : 1, {
            damping: 15,
            stiffness: 150,
          })
        },
      ],
      borderColor: isActive ? '#4CAF50' : 
                  isCorrect ? color : '#E0E0E0',
      borderWidth: isActive ? 3 : isCorrect ? 2 : 2,
      shadowColor: isActive ? '#4CAF50' : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isActive ? 0.8 : 0,
      shadowRadius: isActive ? 10 : 0,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    if (!showHint) return { opacity: 0 };
    
    return {
      opacity: withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.2, { duration: 800 })
        ),
        -1, // Infinite repeat
        true
      ),
      transform: [
        { scale: withRepeat(
          withSequence(
            withTiming(1.1, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          true
        )},
      ],
    };
  });

  const renderTargetShape = () => {
    const size = 50;

    if (type === 'triangle') {
      return (
        <>
          <View
            style={[
              styles.targetTriangle,
              {
                borderBottomWidth: size,
                borderBottomColor: isCorrect ? color + 'CC' : color + '40',
                borderLeftWidth: size / 2,
                borderRightWidth: size / 2,
              },
            ]}
          />
          {isCorrect && (
            <MaterialIcons 
              name="check" 
              size={24} 
              color="white"
              style={styles.correctIcon}
            />
          )}
        </>
      );
    }

    return (
      <>
        <View
          style={[
            styles.targetShape,
            {
              width: size,
              height: size,
              backgroundColor: isCorrect ? color + 'CC' : color + '40',
              borderRadius: type === 'circle' ? size / 2 : 8,
            },
          ]}
        />
        {isCorrect && (
          <MaterialIcons 
            name="check" 
            size={24} 
            color="white"
            style={styles.correctIcon}
          />
        )}
      </>
    );
  };

  return (
    <Animated.View style={[styles.container, { left: x, top: y }, animatedStyle]}>
      {renderTargetShape()}
      
      {/* Hint pulse effect */}
      {showHint && !isCorrect && (
        <Animated.View style={[styles.hintPulse, pulseStyle]} />
      )}
      
      {/* Glow effect for active drop zone */}
      {isActive && (
        <View style={styles.glowEffect} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  targetShape: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  correctIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 2,
  },
  hintPulse: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    zIndex: -1,
  },
  glowEffect: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    zIndex: -1,
  },
});

export default DropZone;
