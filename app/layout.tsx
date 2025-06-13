// This is the new root layout, for pages outside the [slug] tenant context
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // globals.css remains at the app root
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider" // Assuming you have this
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Recrutamento IA - SMARTED",
  description: "Sistema inteligente de recrutamento com análise de currículos por IA",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CustomThemeProvider>
            {children}
            <Toaster />
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
