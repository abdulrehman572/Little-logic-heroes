import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from "react-native";
import { COLORS, SIZES } from "../../theme";;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
  textStyle
}: ButtonProps) {
  const getButtonStyle = () => {
    let baseStyle = styles.button;

    switch (variant) {
      case "secondary":
        return { ...baseStyle, ...styles.secondary };
      case "outline":
        return { ...baseStyle, ...styles.outline };
      default:
        return { ...baseStyle, ...styles.primary };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.small;
      case "large":
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        getSizeStyle(),
        (disabled || loading) && styles.disabled,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? COLORS.primary : "#FFFFFF"}
          size="small"
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    minHeight: SIZES.touchMin
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5
  },
  small: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  medium: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  large: {
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
  },
  text: {
    fontWeight: "600",
    textAlign: "center"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  outlineText: {
    color: COLORS.primary
  }
});


