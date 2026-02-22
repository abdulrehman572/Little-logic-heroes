// src/modules/countingForest/activities/AcornHunt.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import { forestTheme } from '../../../constants/theme';
import { useAdaptiveDifficulty } from '../../../hooks/useAdaptiveDifficulty';

const AcornHunt = ({ onComplete }) => {
  const [counted, setCounted] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedNumeral, setSelectedNumeral] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { level, adjustDifficulty } = useAdaptiveDifficulty('counting');

  useEffect(() => {
    // Generate new set of items based on level
    const activity = new CountingActivity(level);
    setItems(activity.items);
    setCounted(0);
  }, [level]);

  const handleItemPress = async (item) => {
    if (!item.counted) {
      item.counted = true;
      setCounted(prev => prev + 1);
      // Play counting sound
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../../../assets/sounds/count.mp3'));
      await sound.playAsync();
    }
  };

  const handleNumeralSelect = async (num) => {
    setSelectedNumeral(num);
    const correct = counted === items.length;
    if (correct && num === items.length) {
      setFeedback('correct');
      await playSuccess();
      adjustDifficulty(true, Date.now() - startTime);
      setTimeout(() => onComplete(true), 1500);
    } else {
      setFeedback('incorrect');
      await playGentleError();
      adjustDifficulty(false, Date.now() - startTime);
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Count the acorns!</Text>
      
      <View style={styles.itemsGrid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleItemPress(item)}
            style={[styles.item, item.counted && styles.counted]}
          >
            <LottieView
              source={require('../../../assets/animations/acorn.json')}
              autoPlay={!item.counted}
              loop={false}
              style={styles.acorn}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.numerals}>
        {[items.length, items.length+1, items.length-1]
          .filter(n => n >= 1 && n <= 20)
          .sort(() => 0.5 - Math.random())
          .map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numeralButton}
              onPress={() => handleNumeralSelect(num)}
            >
              <Text style={styles.numeralText}>{num}</Text>
            </TouchableOpacity>
          ))}
      </View>

      {feedback && (
        <LottieView
          source={feedback === 'correct' 
            ? require('../../../assets/animations/star.json')
            : require('../../../assets/animations/sad_squirrel.json')
          }
          autoPlay
          style={styles.feedback}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: forestTheme.colors.background, padding: 20 },
  instruction: { fontSize: 24, color: forestTheme.colors.primary, textAlign: 'center', marginBottom: 20 },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  item: { margin: 10, opacity: 1 },
  counted: { opacity: 0.5 },
  acorn: { width: 80, height: 80 },
  numerals: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  numeralButton: { 
    backgroundColor: forestTheme.colors.secondary,
    padding: 20,
    margin: 10,
    borderRadius: 40,
    minWidth: 80,
    alignItems: 'center'
  },
  numeralText: { fontSize: 32, color: 'white', fontWeight: 'bold' }
});