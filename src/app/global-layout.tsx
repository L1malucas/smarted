/**
 * Componente de layout raiz da aplicação que envolve todas as páginas.
 * 
 * @component RootLayout
 * @description Define a estrutura base HTML da aplicação, incluindo a navbar, 
 * conteúdo principal e o componente Toaster para notificações.
 * 
 * @param {IUser | null} props.user - Objeto contendo dados do usuário logado
 * @param {React.ReactNode} props.children - Componentes filhos que serão renderizados dentro do layout
 * 
 * @remarks
 * - Utiliza a fonte 'inter' através da classe {@link inter.className}
 * - Define o idioma padrão como "pt-BR"
 * - Inicializa o usuário como null e o tenantSlug como "default"
 * - O layout é responsivo com classes Tailwind para padding e largura máxima
 * 
 * @example
 * ```tsx
 * <RootLayout>
 *   <MinhasPaginas />
 * </RootLayout>
 * ```
 * 
 * @communication
 * - Passa props {user, tenantSlug} para o componente {@link Navbar}
 * - Renderiza um componente {@link Toaster} para sistema de notificações
 * - Aceita qualquer componente filho através da prop children
 * 
 * @customization
 * - Para alterar o idioma, modifique o atributo lang no elemento html
 * - Para modificar o layout base, ajuste as classes Tailwind no main e div
 * - Para alterar o tenant padrão, modifique a constante tenantSlug
 * - Para implementar autenticação, substitua o user null pelo objeto de usuário atual
 */

// app/layout.tsx
import type React from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/shared/components/contexts/loading-context";
import CustomLoading from "@/shared/components/loading";
import { Navbar } from "@/shared/components/navbar";
import { Toaster } from "@/shared/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Recrutamento IA - SMARTED",
  description: "Sistema inteligente de recrutamento com análise de currículos por IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <Navbar tenantSlug="default" user={null} />
            <main className="min-h-screen bg-gray-50">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Suspense fallback={<CustomLoading />}>
                  {children}
                </Suspense>
              </div>
            </main>
            <Toaster />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
