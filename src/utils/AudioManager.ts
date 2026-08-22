import { Audio } from 'expo-av';

export type SoundType = 
  | 'correct'
  | 'wrong'
  | 'background'
  | 'celebration'
  | 'click'
  | 'level_complete'
  | 'star_reward';

export interface SoundConfig {
  volume?: number;
  shouldPlay?: boolean;
  isLooping?: boolean;
}

class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Audio.Sound> = new Map();
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private soundQueue: Array<{type: SoundType, config: SoundConfig}> = [];
  private isPlaying: boolean = false;

  private constructor() {
    // Set global audio settings
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(console.error);
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Preload all game sounds to prevent lag during gameplay
   */
  public async preloadSounds(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log(' Preloading game sounds...');
      
      const soundDefinitions: Array<{type: SoundType, source: any}> = [
        { type: 'correct', source: require('../../assets/sounds/correct.mp3') },
        { type: 'click', source: require('../../assets/sounds/click.mp3') },
        { type: 'level_complete', source: require('../../assets/sounds/level_complete.mp3') },
        { type: 'star_reward', source: require('../../assets/sounds/star_reward.mp3') },
      ];

      for (const { type, source } of soundDefinitions) {
        try {
          const { sound } = await Audio.Sound.createAsync(source, {
            shouldPlay: false,
            volume: 0.7,
          });
          
          await sound.setStatusAsync({ shouldPlay: false });
          this.sounds.set(type, sound);
          console.log(` Preloaded sound: ${type}`);
        } catch (error) {
          console.warn(` Could not load sound: ${type}`, error);
          // Continue loading other sounds
        }
      }

      this.isInitialized = true;
      console.log(' All sounds preloaded successfully');
      
      // Process any queued sounds
      this.processQueue();
      
    } catch (error) {
      console.error(' Failed to preload sounds:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Play a sound with queuing to prevent overlap
   */
  public async playSound(type: SoundType, config: SoundConfig = {}): Promise<void> {
    // Add to queue
    this.soundQueue.push({ type, config });
    
    // If not currently playing, process queue
    if (!this.isPlaying) {
      await this.processQueue();
    }
  }

  /**
   * Process sound queue one by one
   */
  private async processQueue(): Promise<void> {
    if (this.soundQueue.length === 0 || this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    
    while (this.soundQueue.length > 0) {
      const { type, config } = this.soundQueue.shift()!;
      
      if (this.isMuted) continue;
      
      try {
        const sound = this.sounds.get(type);
        
        if (sound) {
          // Configure sound
          await sound.setStatusAsync({
            volume: config.volume || 0.7,
            shouldPlay: config.shouldPlay ?? true,
            isLooping: config.isLooping ?? false,
            positionMillis: 0, // Start from beginning
          });

          // Play and wait for completion
          await sound.playAsync();
          
          // Get duration and wait for sound to finish (if not looping)
          const status = await sound.getStatusAsync();
          if (!config.isLooping && status.isLoaded) {
            await new Promise(resolve => 
              setTimeout(resolve, status.durationMillis || 1000)
            );
          }
        }
      } catch (error) {
        console.warn(` Failed to play sound ${type}:`, error);
        // Don't stop queue on error
      }
    }
    
    this.isPlaying = false;
  }

  /**
   * Play background music with cross-fade
   */
  public async playBackgroundMusic(): Promise<void> {
    if (this.isMuted) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/background.mp3'),
        {
          isLooping: true,
          volume: 0.3,
          shouldPlay: true,
        }
      );
      
      this.sounds.set('background', sound);
    } catch (error) {
      console.warn(' Background music not available');
    }
  }

  /**
   * Stop specific sound
   */
  public async stopSound(type: SoundType): Promise<void> {
    try {
      const sound = this.sounds.get(type);
      if (sound) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.warn(` Failed to stop sound ${type}:`, error);
    }
  }

  /**
   * Stop all sounds
   */
  public async stopAllSounds(): Promise<void> {
    try {
      for (const [type, sound] of this.sounds) {
        try {
          await sound.stopAsync();
        } catch (error) {
          // Individual failures are okay
        }
      }
    } catch (error) {
      console.warn(' Failed to stop all sounds:', error);
    }
  }

  /**
   * Set global mute state
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted) {
      this.stopAllSounds().catch(console.error);
    }
  }

  /**
   * Cleanup all sounds
   */
  public async cleanup(): Promise<void> {
    try {
      // Clear queue first
      this.soundQueue = [];
      this.isPlaying = false;
      
      // Unload all sounds
      for (const [type, sound] of this.sounds) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          // Individual failures are okay
        }
      }
      
      this.sounds.clear();
      this.isInitialized = false;
      console.log(' Audio manager cleaned up');
      
    } catch (error) {
      console.error(' Error during audio cleanup:', error);
    }
  }

  /**
   * Get current status
   */
  public getStatus(): {
    isInitialized: boolean;
    isMuted: boolean;
    loadedSounds: number;
    queuedSounds: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isMuted: this.isMuted,
      loadedSounds: this.sounds.size,
      queuedSounds: this.soundQueue.length,
    };
  }
}

// Export singleton instance
export default AudioManager.getInstance();
