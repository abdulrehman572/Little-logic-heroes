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

const memoryCards = [
  { id: 1, emoji: "", matched: false },
  { id: 2, emoji: "", matched: false },
  { id: 3, emoji: "", matched: false },
  { id: 4, emoji: "", matched: false },
  { id: 5, emoji: "", matched: false },
  { id: 6, emoji: "", matched: false },
  { id: 7, emoji: "", matched: false },
  { id: 8, emoji: "", matched: false },
];

export default function MemoryMeadowScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState(memoryCards);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleCardPress = (id: number) => {
    if (flippedCards.length >= 2 || flippedCards.includes(id)) return;
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);
      
      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setCards(prev => prev.map(card => 
          card.id === firstId || card.id === secondId 
            ? { ...card, matched: true } 
            : card
        ));
        setMatches(prev => prev + 1);
      }
      
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };
  
  const handleReset = () => {
    setCards(memoryCards);
    setFlippedCards([]);
    setMatches(0);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Memory Meadow </Text>
        <View style={styles.matchesContainer}>
          <Text style={styles.matchesText}>Matches: {matches}/4</Text>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea}>
        <Text style={styles.instructions}>
          Find matching pairs of animals!
        </Text>
        
        <View style={styles.memoryGrid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                (flippedCards.includes(card.id) || card.matched) && styles.cardFlipped
              ]}
              onPress={() => handleCardPress(card.id)}
              disabled={card.matched}
            >
              <Text style={styles.cardEmoji}>
                {(flippedCards.includes(card.id) || card.matched) ? card.emoji : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {matches === 4 && (
          <View style={styles.completionMessage}>
            <Text style={styles.completionText}> Perfect Memory! </Text>
            <Text style={styles.completionSubtext}>
              You found all the matching pairs!
            </Text>
          </View>
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tips */}
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Memory Tips:</Text>
        <Text style={styles.tip}> Remember positions of cards</Text>
        <Text style={styles.tip}> Take your time to think</Text>
        <Text style={styles.tip}> Try to find patterns</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9C89B8"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#8A6DBE"
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
  matchesContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20
  },
  matchesText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white"
  },
  gameArea: {
    flex: 1,
    padding: 20
  },
  instructions: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 30
  },
  memoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    marginBottom: 30
  },
  card: {
    width: 70,
    height: 70,
    backgroundColor: "#FFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  cardFlipped: {
    backgroundColor: "#E0F7FA",
    transform: [{ scale: 1.05 }]
  },
  cardEmoji: {
    fontSize: 28
  },
  completionMessage: {
    backgroundColor: "rgba(76, 217, 123, 0.9)",
    padding: 20,
    borderRadius: 15,
    alignItems: "center"
  },
  completionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10
  },
  completionSubtext: {
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
    backgroundColor: "#8A6DBE",
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
  tips: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10
  },
  tip: {
    fontSize: 14,
    color: "#34495E",
    marginBottom: 5,
    marginLeft: 10
  }
});
