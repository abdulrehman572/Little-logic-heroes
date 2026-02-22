import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

interface CelebrationAnimationProps {
  isActive: boolean;
  message: string;
}

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isActive,
  message,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      
      opacity.value = withTiming(1, { duration: 300 });
      
      rotate.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withSpring(0, { damping: 15 }),
        withDelay(
          200,
          withTiming(5, { duration: 100 })
        ),
        withSpring(0, { damping: 15 })
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isActive]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  if (!isActive) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.starsContainer}>
        {[0, 1, 2, 3, 4].map((i) => (
          <FloatingStar key={i} index={i} />
        ))}
      </View>
      <View style={styles.content}>
        <MaterialIcons name="celebration" size={80} color="#FFD700" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const FloatingStar: React.FC<{ index: number }> = ({ index }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 100;
    
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-20, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) })
      )
    );
    
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1400, withTiming(0, { duration: 200 }))
      )
    );
    
    // Loop the animation
    const interval = setInterval(() => {
      translateY.value = withSequence(
        withTiming(-20, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) })
      );
      
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1400, withTiming(0, { duration: 200 }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const starStyle = useAnimatedStyle(() => {
    const angle = (index * 72) * (Math.PI / 180);
    const radius = 100;
    const x = Math.cos(angle) * radius;
    
    return {
      opacity: opacity.value,
      transform: [
        { translateX: x },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.star, starStyle]}>
      <MaterialIcons name="star" size={24} color="#FFD700" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 2000,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  content: {
    alignItems: 'center',
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A11CB',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'ComicNeue-Bold',
  },
});

export default CelebrationAnimation;
