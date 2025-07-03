"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Palette, Monitor, Moon, Sun } from "lucide-react"
import { useTheme,  } from "@/contexts/theme-context"

import { ThemeSelectorProps } from "@/types/component-props"

export function ThemeSelector({ showLabel = false, variant = "ghost", size = "default" }: ThemeSelectorProps) {
  const { theme, colorMode, setTheme, setColorMode, availableThemes } = useTheme()

  const currentTheme = availableThemes.find((t) => t.value === theme)

  const getColorModeIcon = () => {
    switch (colorMode) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Palette className="h-4 w-4" />
          {showLabel && <span className="hidden sm:inline">{currentTheme?.label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-medium">Aparência</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <div className="text-sm font-medium mb-2">Tema</div>
          <DropdownMenuRadioGroup value={theme} onValueChange={(value: string) => setTheme(value as Theme)}>
            {availableThemes.map((themeOption) => (
              <DropdownMenuRadioItem
                key={themeOption.value}
                value={themeOption.value}
                className="flex flex-col items-start gap-1 py-2"
              >
                <div className="font-medium">{themeOption.label}</div>
                <div className="text-xs text-muted-foreground">{themeOption.description}</div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <div className="text-sm font-medium mb-2">Modo de Cor</div>
          <DropdownMenuRadioGroup value={colorMode} onValueChange={(value) => setColorMode(value as ColorMode)}>
            <DropdownMenuRadioItem value="light" className="gap-2">
              <Sun className="h-4 w-4" />
              Claro
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="gap-2">
              <Moon className="h-4 w-4" />
              Escuro
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className="gap-2">
              <Monitor className="h-4 w-4" />
              Sistema
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
