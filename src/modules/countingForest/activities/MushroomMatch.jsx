// Enhanced drag-drop with quantity feedback
// src/modules/countingForest/activities/MushroomMatch.jsx
import React, { useState, useRef } from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';
import { forestTheme } from '../../../constants/theme';

const MushroomMatch = () => {
  const [mushrooms, setMushrooms] = useState([]);
  const [targetNumber, setTargetNumber] = useState(3);
  const [placed, setPlaced] = useState(0);
  const basketPosition = useRef({ x: 0, y: 0 }).current;

  // Generate mushrooms
  useEffect(() => {
    setMushrooms(Array(10).fill().map((_, i) => ({
      id: i,
      pan: new Animated.ValueXY(),
      placed: false
    })));
  }, []);

  const createPanResponder = (mushroom) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null, { dx: mushroom.pan.x, dy: mushroom.pan.y }
      ], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (isInDropZone(gesture, basketPosition) && placed < targetNumber) {
          // Snap to basket
          Animated.spring(mushroom.pan, {
            toValue: { x: basketPosition.x, y: basketPosition.y },
            useNativeDriver: true
          }).start();
          setPlaced(prev => prev + 1);
          mushroom.placed = true;
        } else {
          // Return
          Animated.spring(mushroom.pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true
          }).start();
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Put {targetNumber} mushrooms in the basket</Text>
      
      <View style={styles.basketArea}>
        <View 
          style={styles.basket}
          onLayout={(event) => {
            basketPosition.x = event.nativeEvent.layout.x;
            basketPosition.y = event.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.basketCount}>{placed}/{targetNumber}</Text>
        </View>
      </View>

      <View style={styles.mushrooms}>
        {mushrooms.map(m => !m.placed && (
          <Animated.View
            key={m.id}
            style={[m.pan.getLayout(), styles.mushroom]}
            {...createPanResponder(m).panHandlers}
          >
            <LottieView source={require('../../../assets/animations/mushroom.json')} style={{width:60,height:60}} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};