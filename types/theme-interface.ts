export type Theme = "brutalism" | "friendly" | "neo-clean";
export type ColorMode = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  colorMode: ColorMode;
  setTheme: (theme: Theme) => void;
  setColorMode: (mode: ColorMode) => void;
}
