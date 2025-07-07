export type ITheme = "brutalism" | "friendly" | "neo-clean";
export type IColorMode = "light" | "dark" | "system";

export interface IThemeContextType {
  theme: ITheme;
  colorMode: IColorMode;
  setTheme: (theme: ITheme) => void;
  setColorMode: (mode: IColorMode) => void;
  availableThemes: { value: ITheme; label: string; description: string }[];
}