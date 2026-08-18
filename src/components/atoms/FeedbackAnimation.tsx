import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

interface FeedbackAnimationProps {
  type: 'success' | 'error';
  isActive: boolean;
  onComplete?: () => void;
}

const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  type,
  isActive,
  onComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      opacity.value = 1;
      scale.value = withSequence(
        withSpring(1.5, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
      
      // Hide after animation
      setTimeout(() => {
        opacity.value = 0;
        scale.value = 0;
        if (onComplete) onComplete();
      }, 800);
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getBackgroundColor = () => {
    return type === 'success' ? '#4CAF50' : '#FF5252';
  };

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          animatedStyle,
          { backgroundColor: getBackgroundColor() }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.7,
  },
});

export default FeedbackAnimation;
