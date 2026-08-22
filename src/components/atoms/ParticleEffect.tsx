import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Particle {
  id: string;
  color: string;
  size: number;
  angle: number;
  distance: number;
}

interface ParticleEffectProps {
  isActive: boolean;
  color: string;
  position: { x: number; y: number };
  onComplete?: () => void;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  isActive,
  color,
  position,
  onComplete,
}) => {
  const particles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
    id: `particle-${i}`,
    color,
    size: Math.random() * 10 + 5,
    angle: (i * 30) * (Math.PI / 180),
    distance: Math.random() * 60 + 40,
  }));

  if (!isActive) return null;

  const Particle = ({ particle }: { particle: Particle }) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
      const duration = 800 + Math.random() * 400;
      
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(
          duration - 200,
          withTiming(0, { duration: 200 })
        )
      );
      
      scale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withSpring(1, { damping: 15 }),
        withDelay(
          duration - 300,
          withTiming(0.5, { duration: 200 })
        )
      );
      
      translateX.value = withTiming(
        Math.cos(particle.angle) * particle.distance,
        { 
          duration,
          easing: Easing.out(Easing.exp)
        }
      );
      
      translateY.value = withTiming(
        Math.sin(particle.angle) * particle.distance,
        { 
          duration,
          easing: Easing.out(Easing.exp)
        }
      );
      
      if (onComplete && particle.id === 'particle-0') {
        setTimeout(() => {
          onComplete();
        }, duration);
      }
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ],
      };
    });

    return (
      <Animated.View
        style={[
          styles.particle,
          {
            left: position.x,
            top: position.y,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: particle.color,
          },
          animatedStyle,
        ]}
      />
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    zIndex: 1000,
  },
});

export default ParticleEffect;
