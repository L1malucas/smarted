"use client"

import { IThemeContextType, ITheme, IColorMode } from "@/shared/types/types/theme-interface"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const ThemeContext = createContext<IThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "recruitment-app-theme"
const COLOR_MODE_STORAGE_KEY = "recruitment-app-color-mode"

export const availableThemes = [
  {
    value: "brutalism" as ITheme,
    label: "Soft Elegant",
    description: "Elegante e minimalista com tons suaves",
  },
  {
    value: "friendly" as ITheme,
    label: "Friendly Humanist",
    description: "Caloroso e acolhedor com cores naturais",
  },
  {
    value: "neo-clean" as ITheme,
    label: "Neo Brutalism",
    description: "Ousado e impactante com contrastes fortes",
  },
]

export function ThemeProvider({ children }: { children: ReactNode }) {
  const getInitialTheme = (): ITheme => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ITheme;
      if (savedTheme && availableThemes.find((t) => t.value === savedTheme)) {
        return savedTheme;
      }
    }
    return "brutalism"; // Default theme if no saved theme or on server
  };

  const getInitialColorMode = (): IColorMode => {
    if (typeof window !== 'undefined') {
      const savedColorMode = localStorage.getItem(COLOR_MODE_STORAGE_KEY) as IColorMode;
      if (savedColorMode) {
        return savedColorMode;
      }
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "dark"; // Default color mode if no saved mode or on server
  };

  const [theme, setThemeState] = useState<ITheme>(getInitialTheme());
  const [colorMode, setColorModeState] = useState<IColorMode>(getInitialColorMode());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // Remove existing theme classes
    availableThemes.forEach((t) => {
      root.classList.remove(`theme-${t.value}`)
    })

    // Add current theme class
    root.classList.add(`theme-${theme}`)

    // Handle color mode
    if (colorMode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
    } else {
      root.classList.toggle("dark", colorMode === "dark")
    }

    // Dynamically import theme CSS
    }, [theme, colorMode, mounted]);

  // Listen for system color scheme changes
  useEffect(() => {
    if (colorMode !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [colorMode])

  const setTheme = (newTheme: ITheme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  const setColorMode = (newMode: IColorMode) => {
    setColorModeState(newMode)
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, newMode)
  }

  const value = {
    theme,
    colorMode,
    setTheme,
    setColorMode,
    availableThemes,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
