// src/hooks/useAdaptiveDifficulty.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAdaptiveDifficulty = (module) => {
  const [level, setLevel] = useState(1);
  const [stats, setStats] = useState({ successes: 0, attempts: 0, avgTime: 0 });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const stored = await AsyncStorage.getItem(`difficulty_${module}`);
    if (stored) setLevel(parseInt(stored));
  };

  const adjustDifficulty = (isCorrect, responseTime) => {
    setStats(prev => {
      const newAttempts = prev.attempts + 1;
      const newSuccesses = prev.successes + (isCorrect ? 1 : 0);
      const newAvgTime = (prev.avgTime * prev.attempts + responseTime) / newAttempts;
      
      // Level up after 3 correct in a row AND response time < 3 seconds
      if (isCorrect && newSuccesses >= 3 && newAvgTime < 3000 && level < 3) {
        setLevel(prev => prev + 1);
        AsyncStorage.setItem(`difficulty_${module}`, (level + 1).toString());
        return { successes: 0, attempts: 0, avgTime: 0 };
      }
      // Level down if 2 incorrect in last 3 attempts
      else if (!isCorrect && newSuccesses / newAttempts < 0.3 && level > 1) {
        setLevel(prev => prev - 1);
        AsyncStorage.setItem(`difficulty_${module}`, (level - 1).toString());
        return { successes: 0, attempts: 0, avgTime: 0 };
      }
      
      return { successes: newSuccesses, attempts: newAttempts, avgTime: newAvgTime };
    });
  };

  return { level, adjustDifficulty };
};