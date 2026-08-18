import { useEffect } from 'react';
import { Audio } from 'expo-av';

export default function useAudio() {
  useEffect(() => {
    // Enable audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  }, []);

  async function playSound(soundType: 'correct' | 'wrong' | 'click' | 'win' | 'count' | number) {
    try {
      // For now, just log - we'll add real sounds later
      if (typeof soundType === 'number') {
        console.log(`Playing count sound for number: ${soundType}`);
      } else {
        console.log(`Playing sound: ${soundType}`);
      }
      
      // In a real app, you would load and play the sound here
      // For counting, you might have different sounds for each number
      // Example: playNumberSound(soundType);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  async function playNumberSound(number: number) {
    try {
      console.log(`Counting: ${number}`);
      // In a real app, you would play "one.mp3", "two.mp3", etc.
    } catch (error) {
      console.log('Error playing number sound:', error);
    }
  }

  return { playSound, playNumberSound };
}
