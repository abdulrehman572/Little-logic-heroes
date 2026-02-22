import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface Shape {
  id: string;
  type: 'circle' | 'square' | 'triangle';
  color: string;
  x: number;
  y: number;
}

interface Target {
  id: string;
  type: 'circle' | 'square' | 'triangle';
  color: string;
  x: number;
  y: number;
}

interface GameState {
  score: number;
  level: number;
  completed: boolean;
  attempts: number;
  showHint: boolean;
}

const useShapeMatchingGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    completed: false,
    attempts: 0,
    showHint: false,
  });

  const [shapes, setShapes] = useState<Shape[]>([
    { id: 'circle1', type: 'circle', color: '#FF6B6B', x: 50, y: 200 },
    { id: 'square1', type: 'square', color: '#4ECDC4', x: 150, y: 200 },
    { id: 'triangle1', type: 'triangle', color: '#FFD166', x: 250, y: 200 },
  ]);

  const [targets, setTargets] = useState<Target[]>([
    { id: 'target-circle', type: 'circle', color: '#FF6B6B', x: 50, y: 400 },
    { id: 'target-square', type: 'square', color: '#4ECDC4', x: 150, y: 400 },
    { id: 'target-triangle', type: 'triangle', color: '#FFD166', x: 250, y: 400 },
  ]);

  const [correctMatches, setCorrectMatches] = useState<Set<string>>(new Set());
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  // Check if shape is over a target
  const checkCollision = (shapeX: number, shapeY: number, target: Target): boolean => {
    const distance = Math.sqrt(
      Math.pow(shapeX - target.x, 2) + Math.pow(shapeY - target.y, 2)
    );
    return distance < 50; // 50px collision radius
  };

  // Handle shape drag
  const handleShapeDrag = useCallback((shapeId: string, x: number, y: number) => {
    // Find which target (if any) the shape is over
    let foundTarget: Target | null = null;
    
    for (const target of targets) {
      if (checkCollision(x, y, target)) {
        foundTarget = target;
        break;
      }
    }

    if (foundTarget) {
      setActiveDropZone(foundTarget.id);
    } else {
      setActiveDropZone(null);
    }
  }, [targets]);

  // Handle shape drop
  const handleShapeDrop = useCallback((shapeId: string, x: number, y: number) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;

    let matchedTarget: Target | null = null;
    
    // Check all targets for collision
    for (const target of targets) {
      if (checkCollision(x, y, target)) {
        matchedTarget = target;
        break;
      }
    }

    if (matchedTarget) {
      // Check if match is correct
      if (shape.type === matchedTarget.type && shape.color === matchedTarget.color) {
        // Correct match!
        setCorrectMatches(prev => new Set([...prev, shapeId]));
        
        setGameState(prev => ({
          ...prev,
          score: prev.score + 100,
          attempts: 0,
        }));

        // Check if all shapes are matched
        if (correctMatches.size + 1 === shapes.length) {
          setGameState(prev => ({ ...prev, completed: true }));
          
          Alert.alert(
            'Level Complete! ',
            `You scored ${gameState.score + 100} points!`,
            [{ text: 'Next Level', onPress: () => nextLevel() }]
          );
        }
      } else {
        // Incorrect match
        setGameState(prev => ({
          ...prev,
          attempts: prev.attempts + 1,
        }));

        if (gameState.attempts + 1 >= 3) {
          setGameState(prev => ({ ...prev, showHint: true }));
        }
      }
    }

    setActiveDropZone(null);
  }, [shapes, targets, correctMatches, gameState]);

  // Move to next level
  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      score: prev.score,
      level: prev.level + 1,
      completed: false,
      attempts: 0,
      showHint: false,
    }));

    setCorrectMatches(new Set());
    
    // For now, just reset positions
    setShapes(prev => prev.map(shape => ({
      ...shape,
      x: shape.x,
      y: 200,
    })));
  }, []);

  return {
    shapes,
    targets,
    gameState,
    correctMatches,
    activeDropZone,
    handleShapeDrag,
    handleShapeDrop,
    nextLevel,
  };
};

export default useShapeMatchingGame;
