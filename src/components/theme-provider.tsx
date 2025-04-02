'use client'
// theme-context.tsx
import React, { createContext, useContext, ReactNode } from "react";

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    primary: string;
  };
  spacing: (factor: number) => string;
}

const theme: Theme = {
  colors: {
    primary: "#1E3A8A",
    secondary: "#ffffff",
    background: "#f5f5f5",
    text: "#333333",
  },
  fonts: {
    primary: "Helvetica, Arial, sans-serif",
  },
  spacing: (factor: number) => `${factor * 8}px`, // 8px * factor
};

// Create the ThemeContext
const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

// Create a hook to use the theme
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
