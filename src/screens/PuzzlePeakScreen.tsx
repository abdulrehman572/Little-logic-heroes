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

export default function PuzzlePeakScreen() {
  const navigation = useNavigation();
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [pieces, setPieces] = useState([
    { id: 1, emoji: "", position: "correct" },
    { id: 2, emoji: "", position: "correct" },
    { id: 3, emoji: "", position: "wrong" },
    { id: 4, emoji: "", position: "wrong" },
  ]);
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handlePiecePress = (id: number) => {
    setPieces(prev => 
      prev.map(piece => 
        piece.id === id 
          ? { ...piece, position: piece.position === "correct" ? "wrong" : "correct" }
          : piece
      )
    );
    
    // Check if puzzle is complete (all pieces in correct position)
    const allCorrect = pieces.every(p => p.position === "correct");
    if (allCorrect) {
      setPuzzleComplete(true);
    }
  };
  
  const handleReset = () => {
    setPieces([
      { id: 1, emoji: "", position: "correct" },
      { id: 2, emoji: "", position: "correct" },
      { id: 3, emoji: "", position: "wrong" },
      { id: 4, emoji: "", position: "wrong" },
    ]);
    setPuzzleComplete(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Puzzle Peak </Text>
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyText}>Easy</Text>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea}>
        <Text style={styles.welcomeText}>Welcome to Puzzle Peak!</Text>
        <Text style={styles.subtitle}>
          Arrange the pieces to complete the mountain scene!
        </Text>
        
        <View style={styles.puzzleFrame}>
          <Text style={styles.frameTitle}>Target Image:</Text>
          <View style={styles.targetImage}>
            <Text style={styles.targetEmoji}></Text>
            <Text style={styles.targetText}>Mountain Scene</Text>
          </View>
        </View>
        
        <View style={styles.puzzlePieces}>
          <Text style={styles.piecesTitle}>Drag pieces here:</Text>
          <View style={styles.piecesGrid}>
            {pieces.map((piece) => (
              <TouchableOpacity
                key={piece.id}
                style={[
                  styles.piece,
                  piece.position === "correct" && styles.pieceCorrect,
                  piece.position === "wrong" && styles.pieceWrong
                ]}
                onPress={() => handlePiecePress(piece.id)}
              >
                <Text style={styles.pieceEmoji}>{piece.emoji}</Text>
                <Text style={styles.pieceStatus}>
                  {piece.position === "correct" ? "" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {puzzleComplete && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}> Puzzle Complete! </Text>
            <Text style={styles.successSubtext}>
              Great problem-solving skills!
            </Text>
          </View>
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Puzzle</Text>
        </TouchableOpacity>
      </View>
      
      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Play:</Text>
        <Text style={styles.instruction}>1. Tap pieces to move them between positions</Text>
        <Text style={styles.instruction}>2. Place all pieces in the correct position</Text>
        <Text style={styles.instruction}>3. Complete the mountain scene puzzle</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0B67F"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#E8A75D"
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
  difficultyContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20
  },
  difficultyText: {
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
  puzzleFrame: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    alignItems: "center"
  },
  frameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15
  },
  targetImage: {
    backgroundColor: "#F5F5F5",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    minWidth: 200
  },
  targetEmoji: {
    fontSize: 40,
    marginBottom: 10
  },
  targetText: {
    fontSize: 16,
    color: "#7F8C8D",
    fontStyle: "italic"
  },
  puzzlePieces: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25
  },
  piecesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
    textAlign: "center"
  },
  piecesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15
  },
  piece: {
    width: 80,
    height: 80,
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DDD"
  },
  pieceCorrect: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CD97B",
    transform: [{ scale: 1.05 }]
  },
  pieceWrong: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FF6B6B"
  },
  pieceEmoji: {
    fontSize: 32,
    marginBottom: 5
  },
  pieceStatus: {
    fontSize: 14,
    color: "#7F8C8D"
  },
  successMessage: {
    backgroundColor: "rgba(76, 217, 123, 0.9)",
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    alignItems: "center"
  },
  successText: {
    fontSize: 22,
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
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  resetButton: {
    backgroundColor: "#E8A75D",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center"
  },
  instructions: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10
  },
  instruction: {
    fontSize: 14,
    color: "#34495E",
    marginBottom: 5,
    marginLeft: 10
  }
});
