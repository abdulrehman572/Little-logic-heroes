import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat
} from "react-native-reanimated";
import { COLORS, SIZES } from "../../constants/theme";

interface DropTargetProps {
  id: number;
  type: "circle" | "square" | "triangle";
  x: number;
  y: number;
  isFilled: boolean;
  isHighlighted: boolean;
}

const DropTarget: React.FC<DropTargetProps> = ({
  id,
  type,
  x,
  y,
  isFilled,
  isHighlighted
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isHighlighted
          ? withRepeat(
              withSequence(
                withTiming(1.1, { duration: 300 }),
                withTiming(1.0, { duration: 300 })
              ),
              -1,
              true
            )
          : withTiming(1.0)
      }
    ],
    borderColor: isHighlighted
      ? withTiming("#4CD97B", { duration: 200 })
      : withTiming(COLORS.border, { duration: 200 })
  }));

  const getTargetStyle = () => {
    switch (type) {
      case "circle":
        return styles.targetCircle;
      case "square":
        return styles.targetSquare;
      case "triangle":
        return styles.targetTriangle;
    }
  };

  const getTargetLabel = () => {
    switch (type) {
      case "circle": return "Circle";
      case "square": return "Square";
      case "triangle": return "Triangle";
    }
  };

  return (
    <Animated.View
      style={[
        styles.target,
        getTargetStyle(),
        animatedStyle,
        { left: x, top: y }
      ]}
    >
      {isFilled ? (
        <View style={[styles.filledIndicator, { backgroundColor: "#4CAF50" }]} />
      ) : (
        <>
          <View style={styles.targetOutline} />
          <Text style={styles.targetHint}>{getTargetLabel()}</Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  target: {
    position: "absolute",
    width: 100,
    height: 100,
    borderWidth: 3,
    borderStyle: "dashed",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  targetCircle: {
    borderRadius: 50,
  },
  targetSquare: {
    borderRadius: 20,
  },
  targetTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  targetOutline: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 20,
  },
  filledIndicator: {
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.8,
  },
  targetHint: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textLight,
    opacity: 0.6,
    marginTop: 60,
    textAlign: "center",
  },
});

export default DropTarget;
