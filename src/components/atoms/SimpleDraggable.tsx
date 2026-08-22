import React, { useState } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

interface SimpleDraggableProps {
  children: React.ReactNode;
  onDrop?: (x: number, y: number) => void;
}

const SimpleDraggable: React.FC<SimpleDraggableProps> = ({ children, onDrop }) => {
  const pan = useState(new Animated.ValueXY())[0];

  const panResponder = useState(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        if (onDrop) {
          onDrop(gesture.moveX, gesture.moveY);
        }
      },
    })
  )[0];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

export default SimpleDraggable;
