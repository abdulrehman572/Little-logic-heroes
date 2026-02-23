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
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")} // Adjust path as needed
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Little Logic Heroes</Text>
          <Text style={styles.subtitle}>Educational games for kids 3-5</Text>
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

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to Play:</Text>
          <Text style={styles.instruction}>✨ Tap any game to start playing</Text>
          <Text style={styles.instruction}>✨ Each game teaches different skills</Text>
          <Text style={styles.instruction}>✨ Use the back button to return here</Text>
          <Text style={styles.instruction}>✨ Have fun learning!</Text>
        </View>

        {/* Developer Credit */}
        <View style={styles.footer}>
          <Text style={styles.developerText}>Developed by Abdul Rehman Baghoor</Text>
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
    borderRadius: 50, // optional: makes it a circle if logo is square
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
  instruction: {
    fontSize: 14,
    color: COLORS.textLight,
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