// This is the new root layout, for pages outside the [slug] tenant context
import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // globals.css remains at the app root
import "@/shared/styles/themes/brutalism.css";
import "@/shared/styles/themes/friendly.css";
import "@/shared/styles/themes/neo-clean.css";
import { Toaster } from "@/shared/components/ui/toaster"
import { ThemeProvider } from "@/shared/components/theme-provider" // Assuming you have this
import { ThemeProvider as CustomThemeProvider } from "@/shared/components/contexts/theme-context"
import CustomLoading from "@/shared/components/loading"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Recrutamento IA - SMARTED",
  description: "Sistema inteligente de recrutamento com análise de currículos por IA",
  icons: {
    icon: "/favicon.ico",
  }
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
            <SessionProvider> {/* Added SessionProvider */}
              <Suspense fallback={<CustomLoading />}>
                {children}
              </Suspense>
            </SessionProvider> {/* Closed SessionProvider */}
            <Toaster />
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
