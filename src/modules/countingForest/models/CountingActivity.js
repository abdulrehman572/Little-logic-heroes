// src/modules/countingForest/models/CountingActivity.js
export class CountingActivity {
  constructor(level) {
    this.level = level;
    this.items = this.generateItems(level);
    this.targetNumber = this.items.length;
    this.answerOptions = this.generateOptions();
  }

  generateItems(level) {
    const count = {1: 5, 2: 10, 3: 20}[level] || 5;
    return Array(count).fill().map(() => ({
      id: Math.random(),
      type: ['acorn', 'mushroom', 'carrot'][Math.floor(Math.random()*3)]
    }));
  }

  generateOptions() {
    // Generate 3 options: correct, one less, one more (or random)
    const correct = this.targetNumber;
    const wrong1 = correct + 1 > 20 ? correct - 1 : correct + 1;
    const wrong2 = correct - 1 < 1 ? correct + 2 : correct - 1;
    return [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
  }
}