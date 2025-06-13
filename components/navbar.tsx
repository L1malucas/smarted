"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LayoutDashboard, Briefcase, Shield, LogOut, Menu, X, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SystemNotification } from "@/types"
import { User } from "@/types/user-interface"
import { ThemeSelector } from "./theme-selector"

interface NavbarProps {
  tenantSlug: string
  user: User | null // Pass user prop
}

/**
 * Componente de navegação principal da aplicação.
 * 
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {string} props.tenantSlug - Identificador único do tenant/organização atual
 * @param {Object} props.user - Objeto contendo dados do usuário logado
 * @param {string} props.user.name - Nome do usuário
 * @param {string} props.user.slug - Identificador único do usuário
 * @param {boolean} props.user.isAdmin - Flag que indica se o usuário é administrador
 * 
 * @remarks
 * Este componente renderiza a barra de navegação principal com:
 * - Logo da empresa linkando para o dashboard
 * - Links de navegação principal (Dashboard, Recrutamento)
 * - Link de administração (visível apenas para admins)
 * - Sistema de notificações
 * - Menu de usuário com opção de logout
 * - Versão responsiva para mobile com menu hamburguer
 * 
 * @dependencies
 * - usePathname() do Next.js para controle de rotas ativas
 * - useState para gerenciamento de estados locais
 * - Diversos componentes do sistema de design (Button, DropdownMenu, etc)
 * - Ícones do pacote Lucide
 * 
 * @communication
 * - Recebe dados do usuário e tenant via props
 * - Integra com sistema de roteamento do Next.js
 * - Simula integração com sistema de notificações (mock)
 * - Prepara integração com sistema de autenticação (handleLogout)
 * 
 * @customization
 * Para modificar:
 * - Adicionar novos items: expandir array 'navigation'
 * - Alterar estilos: modificar classes Tailwind
 * - Adicionar features: expandir objetos de notificação
 * - Modificar comportamento mobile: ajustar lógica de isMobileMenuOpen
 * 
 * @returns Retorna null em rotas públicas/login ou componente Nav com toda navegação
 */
export function Navbar({ tenantSlug, user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: `/${tenantSlug}/dashboard`, icon: LayoutDashboard },
    { name: "Recrutamento", href: `/${tenantSlug}/jobs`, icon: Briefcase }, // "Recrutamento" now links to jobs list
    // Triagem, Avaliação, Contato are accessed from within the /jobs flow or specific job details
  ]

  const adminNavigation = user?.isAdmin ? { name: "Administração", href: `/${tenantSlug}/admin`, icon: Shield } : null

  const handleLogout = () => {
    console.log("Logging out...")
    router.push('/login'); // In a real app
  }

  // Do not render Navbar on login, public, or apply pages
  if (
    pathname === "/login" ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/apply/") ||
    !user // Also don't render if no user (should be caught by layout, but good check)
  ) {
    return null
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href={`/${tenantSlug}/dashboard`} className="flex items-center gap-2">
                <Image src="/logo.png" alt="SMARTED TECH SOLUTIONS" width={150} height={35} />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                      pathname.startsWith(item.href) ||
                        (item.name === "Recrutamento" &&
                          (pathname.startsWith(`/${tenantSlug}/jobs`) ||
                            pathname.startsWith(`/${tenantSlug}/screening`) ||
                            pathname.startsWith(`/${tenantSlug}/evaluation`) ||
                            pathname.startsWith(`/${tenantSlug}/contact`)))
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-foreground hover:border-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              {adminNavigation && (
                <Link
                  href={adminNavigation.href}
                  className={cn(
                    "inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                    pathname.startsWith(adminNavigation.href)
                      ? "border-red-500 text-red-500"
                      : "border-transparent text-foreground hover:border-muted-foreground hover:text-foreground",
                  )}
                >
                  <adminNavigation.icon className="h-4 w-4" />
                  {adminNavigation.name}
                </Link>
              )}
            </div>
          </div>
          <ThemeSelector />
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.slug}</p>
                  </div>
                  {user.isAdmin && (
                    <Badge variant="destructive" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors",
                    pathname.startsWith(item.href) ||
                      (item.name === "Recrutamento" &&
                        (pathname.startsWith(`/${tenantSlug}/jobs`) ||
                          pathname.startsWith(`/${tenantSlug}/screening`) ||
                          pathname.startsWith(`/${tenantSlug}/evaluation`) ||
                          pathname.startsWith(`/${tenantSlug}/contact`)))
                      ? "border-blue-500 bg-blue-950/10 text-blue-500"
                      : "border-transparent text-foreground hover:border-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
            {adminNavigation && (
              <Link
                href={adminNavigation.href}
                className={cn(
                  "flex items-center gap-2 border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors",
                  pathname.startsWith(adminNavigation.href)
                    ? "border-red-500 bg-red-950/10 text-red-500"
                    : "border-transparent text-foreground hover:border-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <adminNavigation.icon className="h-5 w-5" />
                {adminNavigation.name}
              </Link>
            )}
          </div>
          <div className="border-t border-muted pb-3 pt-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex-shrink-0">
                <div className="text-base font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.slug}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <ThemeSelector size="icon" />
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
