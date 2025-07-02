'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

interface CustomThemeProviderProps extends ThemeProviderProps {
  children: React.ReactNode;
  selectedTheme?: string; // Adiciona a prop para o tema selecionado
}

export function ThemeProvider({ children, selectedTheme, ...props }: CustomThemeProviderProps) {
  // next-themes já adiciona a classe 'dark' ou 'light' ao html
  // Precisamos adicionar a classe do tema customizado (ex: theme-brutalism)
  React.useEffect(() => {
    if (selectedTheme) {
      document.documentElement.classList.add(`theme-${selectedTheme}`);
    }
    return () => {
      if (selectedTheme) {
        document.documentElement.classList.remove(`theme-${selectedTheme}`);
      }
    };
  }, [selectedTheme]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}