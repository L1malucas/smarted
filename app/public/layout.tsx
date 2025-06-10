import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Visualização Pública - Sistema de Recrutamento IA",
  description: "Visualização pública de recursos do sistema de recrutamento",
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <header className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <Image src="/logo.png" alt="SMARTED TECH SOLUTIONS" width={180} height={40} />
              </div>
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
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
        <footer className="border-t bg-background py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} SMARTED TECH SOLUTIONS. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
