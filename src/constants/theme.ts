export const COLORS = {
  primary: "#4A6FA5",
  secondary: "#FFB347",
  accent: "#FF6B6B",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
  border: "#E0E0E0",
  success: "#4CAF50",
  
  // Module colors
  shapes: "#FF9E6D",
  counting: "#6DCEFF", 
  patterns: "#C780E8",
  logic: "#4CD97B"
} as const;

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Touch targets (minimum 44x44)
  touchMin: 44
} as const;

export const ANIMATION = {
  durationFast: 150,
  durationNormal: 300,
  durationSlow: 500,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)"
} as const;

