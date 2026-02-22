import { useCallback } from 'react';
import { useAudio } from '../contexts/AudioContext';

export const useGameSounds = () => {
  const { playSound, setMuted, isMuted } = useAudio();

  const playCorrectSound = useCallback((volume: number = 0.8) => {
    playSound('correct', { 
      volume: Math.min(volume, 0.8), // Cap volume for consistency
    });
  }, [playSound]);

  const playClickSound = useCallback(() => {
    playSound('click', { volume: 0.5 });
  }, [playSound]);

  const playLevelCompleteSound = useCallback(() => {
    playSound('level_complete', { volume: 0.7 });
  }, [playSound]);

  const playStarRewardSound = useCallback(() => {
    playSound('star_reward', { volume: 0.6 });
  }, [playSound]);

  const playSpatialSound = useCallback((x: number, y: number, screenWidth: number) => {
    // Calculate pan based on position (left/right)
    // For now, we'll use simple stereo effect
    const pan = (x / screenWidth) * 2 - 1; // -1 to 1
    console.log('Spatial audio would pan to:', pan);
    // Note: expo-av doesn't support pan directly, but we can simulate with volume
    playSound('star_reward', { volume: 0.6 });
  }, [playSound]);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  return {
    playCorrectSound,
    playClickSound,
    playLevelCompleteSound,
    playStarRewardSound,
    playSpatialSound,
    toggleMute,
    isMuted,
  };
};

export default useGameSounds;
