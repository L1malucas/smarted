"use client"

import { ThemeSelector } from "@/shared/components/theme-selector"

export function LoginThemeSelector() {
  return (
    <div className="absolute top-4 right-4">
      <ThemeSelector variant="outline" size="icon" />
    </div>
  )
}
