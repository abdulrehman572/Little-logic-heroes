// Game utilities for Little Logic Heroes

export const calculateScore = (timeTaken: number, attempts: number, perfect: boolean = false): number => {
  let score = 100;
  
  // Deduct points for time taken (max 30 seconds)
  if (timeTaken > 30) score -= 30;
  else score -= timeTaken;
  
  // Deduct points for attempts
  score -= (attempts - 1) * 5;
  
  // Bonus for perfect match
  if (perfect) score += 20;
  
  return Math.max(10, score);
};

export const getStarRating = (score: number): number => {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
};

export const getEncouragementMessage = (score: number, timeTaken: number): string => {
  const messages = [
    "Great job! You're a shape master! 🎉",
    "Well done! Keep practicing! 👍",
    "Good effort! Try again for a higher score! 💪",
    "You did it! Ready for the next challenge? 🚀"
  ];
  
  const index = Math.min(Math.floor(score / 25), messages.length - 1);
  return messages[index];
};

export const shapeData = {
  circle: {
    name: "Circle",
    color: "#FF6B6B",
    description: "A round shape with no corners"
  },
  square: {
    name: "Square", 
    color: "#4A6FA5",
    description: "A shape with four equal sides"
  },
  triangle: {
    name: "Triangle",
    color: "#4CD97B", 
    description: "A shape with three sides"
  }
};

export const difficultyLevels = {
  easy: {
    shapeCount: 3,
    timeLimit: 60,
    targetSize: 100
  },
  medium: {
    shapeCount: 5,
    timeLimit: 45,
    targetSize: 80
  },
  hard: {
    shapeCount: 7,
    timeLimit: 30,
    targetSize: 60
  }
};
