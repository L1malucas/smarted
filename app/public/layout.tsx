/**
 * Layout base para páginas públicas da aplicação
 * 
 * @component PublicLayout
 * @description
 * Este componente define a estrutura básica das páginas públicas, incluindo:
 * - Header com logo e botão de login
 * - Container principal para conteúdo dinâmico
 * - Footer com copyright
 * 
 * O layout utiliza o sistema de design tokens do projeto para cores e espaçamentos,
 * através das classes tailwind (bg-background, max-w-7xl, etc)
 * 
 * @example
 * ```tsx
 * <PublicLayout>
 *   <MinhaComponentePublico />
 * </PublicLayout>
 * ```
 * 
 * @param props - Propriedades do componente
 * @param props.children - Elementos filhos que serão renderizados no container principal
 * 
 * @requires next/image - Para renderização otimizada da logo
 * @requires next/link - Para navegação client-side do botão de login
 * @requires components/ui/button - Componente Button do design system
 * 
 * @customization
 * - Modificar src="/logo.png" para alterar a logo
 * - Ajustar max-w-7xl para alterar largura máxima do conteúdo
 * - Personalizar classes bg-background para mudar cores de fundo
 */

// app/public/layout.tsx
"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LoadingProvider } from "@/contexts/loading-context"
import { ThemeSelector } from "@/components/theme-selector"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LoadingProvider>
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="SMARTED TECH SOLUTIONS"
                width={180}
                height={40}
              />
            </div>
            <ThemeSelector />
            <div>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Entrar no sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="border-t bg-background py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SMARTED TECH SOLUTIONS. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </LoadingProvider>
  )
}
