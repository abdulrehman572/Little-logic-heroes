// src/screens/HomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme";

const modules = [
  {
    id: 1,
    title: "Shape Kingdom",
    color: COLORS.shapes,
    icon: "🔷",
    description: "Drag shapes to matching spots",
    screen: "ShapeKingdom",
  },
  {
    id: 2,
    title: "Counting Forest",
    color: COLORS.counting,
    icon: "🌳",
    description: "Count with friendly animals",
    screen: "CountingForest",
  },
  {
    id: 3,
    title: "Pattern Path",
    color: COLORS.patterns,
    icon: "🔶",
    description: "Discover patterns and sequences",
    screen: "PatternPath",
  },
  {
    id: 4,
    title: "Logic Land",
    color: COLORS.logic,
    icon: "🧩",
    description: "Solve fun logic puzzles",
    screen: "LogicLand",
  },
  {
    id: 5,
    title: "Memory Meadow",
    color: "#9C89B8",
    icon: "🧠",
    description: "Train your memory with animals",
    screen: "MemoryMeadow",
  },
  {
    id: 6,
    title: "Puzzle Peak",
    color: "#F0B67F",
    icon: "⛰️",
    description: "Complete mountain scene puzzles",
    screen: "PuzzlePeak",
  },
  // NEW MODULES
  {
    id: 7,
    title: "ABC Learning",
    color: "#F9C74F",
    icon: "🔤",
    description: "Learn letters and phonics",
    screen: "ABC",
  },
  {
    id: 8,
    title: "Counting",
    color: "#90BE6D",
    icon: "🔢",
    description: "Practice numbers 1-10",
    screen: "Counting",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  // Handlers for hyperlink instructions
  const handleGamePress = () => {
    Alert.alert("Tip", "How to Play");
  };
  const handleSkillPress = () => {
    Alert.alert(
      "Skills",
      "Each game teaches shape recognition, counting, patterns, logic, memory, and puzzles."
    );
  };
  const handleBackInfo = () => {
    Alert.alert(
      "Navigation",
      "Use the back button at the top left to return to this home screen."
    );
  };
  const handleFunPress = () => {
    Alert.alert("Enjoy!", "Have fun learning with NGES!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>NGES </Text>
          <Text style={styles.title}>Smart Learning</Text>
          <Text style={styles.subtitle}>Play Learn Earn and Lead the Future</Text>
        </View>

        {/* Modules Grid */}
        <View style={styles.modulesGrid}>
          {modules.map((module) => (
            <View key={module.id} style={styles.moduleContainer}>
              <TouchableOpacity
                style={[styles.moduleButton, { backgroundColor: module.color }]}
                onPress={() => navigation.navigate(module.screen as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.moduleIcon}>{module.icon}</Text>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDesc}>{module.description}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* How to Play - Hyperlinks */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to Play:</Text>
          <Text style={styles.hyperlink} onPress={handleGamePress}>
            ✨ Tap any game to start playing
          </Text>
          <Text style={styles.hyperlink} onPress={handleSkillPress}>
            ✨ Each game teaches different skills
          </Text>
          <Text style={styles.hyperlink} onPress={handleBackInfo}>
            ✨ Use the back button to return here
          </Text>
          <Text style={styles.hyperlink} onPress={handleFunPress}>
            ✨ Have fun learning!
          </Text>
        </View>

        {/* Developer Credit */}
        <View style={styles.footer}>
          <Text style={styles.developerText}>
            Copyright © 2026 Next Gen Education System. 
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.md,
    paddingBottom: SIZES.xxl,
  },
  header: {
    marginBottom: SIZES.xl,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SIZES.sm,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SIZES.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: "center",
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moduleContainer: {
    width: "48%",
    marginBottom: SIZES.lg,
  },
  moduleButton: {
    borderRadius: 20,
    padding: SIZES.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  moduleIcon: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: SIZES.xs,
    textAlign: "center",
  },
  moduleDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  instructions: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: SIZES.lg,
    marginTop: SIZES.md,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  hyperlink: {
    fontSize: 14,
    color: "#0645AD", // classic link blue
    textDecorationLine: "underline",
    marginBottom: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  footer: {
    marginTop: SIZES.xl,
    alignItems: "center",
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  developerText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
});