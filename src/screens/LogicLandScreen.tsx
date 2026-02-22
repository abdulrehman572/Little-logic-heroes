import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/theme";

export default function LogicLandScreen() {
  const navigation = useNavigation();
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleSolvePuzzle = () => {
    setPuzzleSolved(true);
  };
  
  const handleReset = () => {
    setPuzzleSolved(false);
  };
  
  const puzzles = [
    { question: "If all cats are animals, and Fluffy is a cat, then Fluffy is...", answer: "Animal" },
    { question: "Which shape doesn't belong: , , , ?", answer: "" },
    { question: "Complete the sequence: 2, 4, 6, ?", answer: "8" }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Logic Land </Text>
        <View style={styles.puzzlesContainer}>
          <Text style={styles.puzzlesText}>Puzzles: 3</Text>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea}>
        <Text style={styles.welcomeText}>Welcome to Logic Land!</Text>
        <Text style={styles.subtitle}>
          Solve fun logic puzzles to train your brain!
        </Text>
        
        <View style={styles.puzzleCard}>
          <Text style={styles.puzzleTitle}>Puzzle #1</Text>
          <Text style={styles.puzzleQuestion}>
            {puzzles[0].question}
          </Text>
          
          <View style={styles.answerOptions}>
            {["Animal", "Plant", "Robot", "Car"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  puzzleSolved && option === puzzles[0].answer && styles.correctOption
                ]}
                onPress={handleSolvePuzzle}
                disabled={puzzleSolved}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {puzzleSolved && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}> Correct! You solved the puzzle!</Text>
            <Text style={styles.successSubtext}>
              Great logical thinking! Ready for the next challenge?
            </Text>
          </View>
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={handleSolvePuzzle} 
          style={styles.solveButton}
          disabled={puzzleSolved}
        >
          <Text style={styles.solveButtonText}>
            {puzzleSolved ? " Solved" : "Solve Puzzle"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
      
      {/* Puzzle List */}
      <View style={styles.puzzleList}>
        <Text style={styles.listTitle}>More Puzzles:</Text>
        {puzzles.slice(1).map((puzzle, index) => (
          <View key={index} style={styles.puzzleItem}>
            <Text style={styles.puzzleItemText}>{puzzle.question}</Text>
            <Text style={styles.puzzleHint}>(Tap to reveal answer)</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.logic
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#4CD97B"
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white"
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white"
  },
  puzzlesContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20
  },
  puzzlesText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white"
  },
  gameArea: {
    flex: 1,
    padding: 20
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 30,
    textAlign: "center"
  },
  puzzleCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 25,
    borderRadius: 20,
    marginBottom: 20
  },
  puzzleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15
  },
  puzzleQuestion: {
    fontSize: 18,
    color: "#34495E",
    marginBottom: 25,
    lineHeight: 26
  },
  answerOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15
  },
  optionButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    minWidth: 120,
    alignItems: "center"
  },
  correctOption: {
    backgroundColor: "#4CD97B",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50"
  },
  successMessage: {
    backgroundColor: "rgba(76, 217, 123, 0.9)",
    padding: 20,
    borderRadius: 15,
    marginTop: 20
  },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10
  },
  successSubtext: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center"
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  solveButton: {
    backgroundColor: "#4CD97B",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 140
  },
  solveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center"
  },
  resetButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 140
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center"
  },
  puzzleList: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15
  },
  puzzleItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  puzzleItemText: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 5
  },
  puzzleHint: {
    fontSize: 12,
    color: "#7F8C8D",
    fontStyle: "italic"
  }
});
