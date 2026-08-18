import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface TestButtonProps {
  onPress: () => void;
  title: string;
  testId?: string;
}

export default function TestButton({ onPress, title, testId }: TestButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      testID={testId}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4A6FA5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});
