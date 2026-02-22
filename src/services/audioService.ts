import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioService {
  private static instance: AudioService;
  private sounds: Map<string, Audio.Sound> = new Map();
  private isEnabled = true;
  private hapticsEnabled = true;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async loadSounds() {
    try {
      // Note: In a real app, you would load actual sound files
      // For now, we'll create placeholder sounds
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to load sounds:', error);
    }
  }

  async playSound(soundName: string) {
    if (!this.isEnabled) return;

    try {
      // Simulate sound playback
      console.log(`Playing sound: ${soundName}`);
      
      // In a real app, you would play actual sound files
      switch (soundName) {
        case 'match':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'drag':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'drop':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'win':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  toggleSound(enabled: boolean) {
    this.isEnabled = enabled;
  }

  toggleHaptics(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  async unloadSounds() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

export default AudioService.getInstance();
