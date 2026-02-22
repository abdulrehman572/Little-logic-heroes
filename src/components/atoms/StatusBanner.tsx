import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

interface StatusBannerProps {
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export default function StatusBanner({ message, type }: StatusBannerProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case "success": return COLORS.success;
      case "warning": return "#FFC107";
      case "error": return "#F44336";
      default: return COLORS.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

