import type { Theme } from "../store/uiStore";

export const themes = {
  dark: {
    // Background colors
    bg: {
      primary: "bg-gray-900",
      secondary: "bg-gray-800",
      tertiary: "bg-gray-950",
      hover: "bg-gray-800",
      container: "bg-gray-300",
    },
    // Text colors
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      tertiary: "text-gray-400",
      muted: "text-gray-500",
    },
    // Border colors
    border: {
      primary: "border-gray-800",
      secondary: "border-gray-700",
      focus: "border-emerald-600",
    },
    // Message bubbles
    message: {
      mine: "bg-emerald-600 text-white",
      theirs: "bg-gray-800 border border-gray-700 text-white",
      timestamp: "text-gray-200",
    },
    // Input fields
    input: {
      bg: "bg-gray-800/70",
      border: "border-gray-700",
      text: "text-white",
      placeholder: "placeholder:text-gray-500",
    },
    // Cards
    card: {
      bg: "bg-gray-900",
      border: "border-gray-800",
      hover: "hover:bg-gray-800",
    },
    // Header
    header: {
      bg: "bg-emerald-950/30",
      border: "border-emerald-900/30",
    },
    // Avatar fallback
    avatar: {
      bg: "bg-gray-800",
      border: "border-gray-700",
      text: "text-gray-400",
    },
    // Form input
    form: {
      bg: "bg-emerald-950/30",
      border: "border-gray-800",
    },
  },
  light: {
    // Background colors
    bg: {
      primary: "bg-white",
      secondary: "bg-gray-50",
      tertiary: "bg-gray-100",
      hover: "bg-gray-100",
      container: "bg-gray-200",
    },
    // Text colors
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-700",
      tertiary: "text-gray-600",
      muted: "text-gray-500",
    },
    // Border colors
    border: {
      primary: "border-gray-200",
      secondary: "border-gray-300",
      focus: "border-emerald-600",
    },
    // Message bubbles
    message: {
      mine: "bg-emerald-600 text-white",
      theirs: "bg-gray-100 border border-gray-300 text-gray-900",
      timestamp: "text-gray-900",
    },
    // Input fields
    input: {
      bg: "bg-white",
      border: "border-gray-300",
      text: "text-gray-900",
      placeholder: "placeholder:text-gray-400",
    },
    // Cards
    card: {
      bg: "bg-white",
      border: "border-gray-200",
      hover: "hover:bg-gray-50",
    },
    // Header
    header: {
      bg: "bg-emerald-200",
      border: "border-emerald-200",
    },
    // Avatar fallback
    avatar: {
      bg: "bg-gray-100",
      border: "border-gray-300",
      text: "text-gray-600",
    },
    // Form input
    form: {
      bg: "bg-emerald-200/50",
      border: "border-gray-200",
    },
  },
};

export type ThemeConfig = typeof themes.dark;

export const getTheme = (theme: Theme): ThemeConfig => themes[theme];
