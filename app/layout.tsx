import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // globals.css remains at the app root
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider" // Assuming you have this
import { LoadingProvider } from "@/contexts/loading-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Recrutamento IA - SMARTED",
  description: "Sistema inteligente de recrutamento com análise de currículos por IA",
}

/**
 * Layout raiz da aplicação Next.js que envolve todas as páginas.
 * 
 * @component RootLayout
 * @description
 * Este componente define a estrutura base HTML da aplicação, incluindo:
 * - Configuração do idioma para português brasileiro
 * - Integração com o ThemeProvider para gerenciamento de temas claro/escuro
 * - Suporte ao sistema de notificações toast através do componente Toaster
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos que serão renderizados dentro do layout
 * 
 * @remarks
 * - Utiliza a fonte 'inter' através da classe inter.className
 * - Suprime avisos de hidratação com suppressHydrationWarning
 * - Configurado com tema escuro como padrão, mas permite alteração pelo sistema
 * - Desabilita transições de tema para melhor performance
 * 
 * @example
 * ```tsx
 * <RootLayout>
 *   <MinhasPaginas />
 * </RootLayout>
 * ```
 */
//layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LoadingProvider>
            {children}
            <Toaster />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
