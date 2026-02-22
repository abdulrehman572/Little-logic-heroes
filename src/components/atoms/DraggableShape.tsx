import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { View } from 'react-native';

interface DraggableShapeProps {
  id: string;
  type: 'circle' | 'square' | 'triangle';
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  onDrop: (id: string, x: number, y: number) => Promise<boolean>;
}

const DraggableShape: React.FC<DraggableShapeProps> = ({
  id,
  type,
  color,
  size,
  initialX,
  initialY,
  onDrop,
}) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);
  const startX = useRef(initialX);
  const startY = useRef(initialY);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
      isDragging.value = true;
      scale.value = withSpring(1.2);
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: async (event, ctx) => {
      isDragging.value = false;
      scale.value = withSpring(1);
      
      const finalX = ctx.startX + event.translationX;
      const finalY = ctx.startY + event.translationY;
      
      // Call onDrop and check if it was correct
      const isCorrect = await runOnJS(onDrop)(id, finalX, finalY);
      
      if (!isCorrect) {
        // Snap back to original position if incorrect
        translateX.value = withSpring(startX.current);
        translateY.value = withSpring(startY.current);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: isDragging.value ? 0.9 : 1,
      zIndex: isDragging.value ? 1000 : 1,
    };
  });

  const renderShape = () => {
    const shapeStyle = {
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: type === 'circle' ? size / 2 : type === 'square' ? 8 : 0,
    };

    if (type === 'triangle') {
      return (
        <View
          style={[
            styles.triangle,
            {
              borderBottomWidth: size,
              borderBottomColor: color,
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
            },
          ]}
        />
      );
    }

    return <View style={[styles.shape, shapeStyle]} />;
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {renderShape()}
        {isDragging.value && (
          <View style={styles.shadow} />
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shape: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ translateY: -15 }], // Center the triangle
  },
  shadow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: -1,
  },
});

export default DraggableShape;
