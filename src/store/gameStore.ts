import { create } from 'zustand';

interface GameState {
  // Shape Kingdom game
  shapeKingdomScore: number;
  shapeKingdomHighScore: number;
  shapeKingdomCompleted: boolean;
  
  // Actions
  updateShapeKingdomScore: (points: number) => void;
  resetShapeKingdomScore: () => void;
  completeShapeKingdom: () => void;
  
  // Player progress
  unlockedModules: string[];
  unlockModule: (moduleId: string) => void;
  
  // Settings
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

const useGameStore = create<GameState>((set) => ({
  // Initial state
  shapeKingdomScore: 0,
  shapeKingdomHighScore: 0,
  shapeKingdomCompleted: false,
  unlockedModules: ['shape-kingdom'],
  soundEnabled: true,
  hapticsEnabled: true,
  
  // Actions
  updateShapeKingdomScore: (points) => 
    set((state) => {
      const newScore = state.shapeKingdomScore + points;
      const newHighScore = Math.max(state.shapeKingdomHighScore, newScore);
      return { 
        shapeKingdomScore: newScore,
        shapeKingdomHighScore: newHighScore 
      };
    }),
    
  resetShapeKingdomScore: () => 
    set({ shapeKingdomScore: 0, shapeKingdomCompleted: false }),
    
  completeShapeKingdom: () => 
    set({ shapeKingdomCompleted: true }),
    
  unlockModule: (moduleId) => 
    set((state) => ({
      unlockedModules: [...new Set([...state.unlockedModules, moduleId])]
    })),
    
  toggleSound: () => 
    set((state) => ({ soundEnabled: !state.soundEnabled })),
    
  toggleHaptics: () => 
    set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
}));

export default useGameStore;
