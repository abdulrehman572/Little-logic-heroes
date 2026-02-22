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

export default function PatternPathScreen() {
  const navigation = useNavigation();
  const [pattern, setPattern] = useState(["", "", "", ""]);
  const [userPattern, setUserPattern] = useState<string[]>([]);
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleColorPress = (color: string) => {
    setUserPattern([...userPattern, color]);
    
    if (userPattern.length + 1 === pattern.length) {
      const isCorrect = [...userPattern, color].every((c, i) => c === pattern[i]);
      if (isCorrect) {
        alert(" Pattern matched correctly!");
      }
    }
  };
  
  const handleReset = () => {
    setUserPattern([]);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pattern Path </Text>
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level: 1</Text>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea}>
        <Text style={styles.instructions}>
          Repeat the pattern!
        </Text>
        
        <View style={styles.patternDisplay}>
          <Text style={styles.patternTitle}>Pattern to match:</Text>
          <View style={styles.patternRow}>
            {pattern.map((color, index) => (
              <View key={index} style={styles.patternItem}>
                <Text style={styles.patternIcon}>{color}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.userPattern}>
          <Text style={styles.userTitle}>Your pattern:</Text>
          <View style={styles.userRow}>
            {userPattern.map((color, index) => (
              <View key={index} style={styles.userItem}>
                <Text style={styles.userIcon}>{color}</Text>
              </View>
            ))}
            {userPattern.length === 0 && (
              <Text style={styles.emptyText}>Tap colors below</Text>
            )}
          </View>
        </View>
        
        <View style={styles.colorButtons}>
          {["", "", "", ""].map((color) => (
            <TouchableOpacity
              key={color}
              style={styles.colorButton}
              onPress={() => handleColorPress(color)}
            >
              <Text style={styles.colorIcon}>{color}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Pattern</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.patterns
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#C780E8"
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
  levelContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20
  },
  levelText: {
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
  patternDisplay: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
    textAlign: "center"
  },
  patternRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15
  },
  patternItem: {
    width: 60,
    height: 60,
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  patternIcon: {
    fontSize: 28
  },
  userPattern: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30
  },
  userTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
    textAlign: "center"
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    minHeight: 60
  },
  userItem: {
    width: 50,
    height: 50,
    backgroundColor: "#E0F7FA",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center"
  },
  userIcon: {
    fontSize: 24
  },
  emptyText: {
    fontSize: 16,
    color: "#7F8C8D",
    fontStyle: "italic"
  },
  colorButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30
  },
  colorButton: {
    width: 70,
    height: 70,
    backgroundColor: "white",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  colorIcon: {
    fontSize: 32
  },
  controls: {
    padding: 20,
    alignItems: "center"
  },
  resetButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C780E8",
    textAlign: "center"
  }
});
