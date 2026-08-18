import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SimpleShapeProps {
  type: 'circle' | 'square' | 'triangle';
  color: string;
  size?: number;
}

const SimpleShape: React.FC<SimpleShapeProps> = ({ type, color, size = 60 }) => {
  const getShapeStyle = () => {
    switch (type) {
      case 'circle':
        return { ...styles.shape, ...styles.circle, backgroundColor: color, width: size, height: size };
      case 'square':
        return { ...styles.shape, ...styles.square, backgroundColor: color, width: size, height: size };
      case 'triangle':
        return { ...styles.triangle, borderBottomColor: color, borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size };
      default:
        return { ...styles.shape, backgroundColor: color, width: size, height: size };
    }
  };

  return (
    <View style={getShapeStyle()} />
  );
};

const styles = StyleSheet.create({
  shape: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  circle: {
    borderRadius: 30,
  },
  square: {
    borderRadius: 10,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default SimpleShape;
