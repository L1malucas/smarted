"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import { authService } from "@/services/auth"
import { CandidateButton } from "@/components/candidate-button"

/**
 * @description Página de login do sistema de recrutamento IA.
 * Gerencia autenticação via CPF e redirecionamento baseado em tenant_slug.
 * 
 * @component LoginPage
 * 
 * @hooks
 * - useState - Gerencia estados do CPF e loading
 * - useRouter - Navegação entre rotas
 * - useSearchParams - Acessa parâmetros da URL
 * 
 * @dependencies
 * - authService - Serviço responsável pela autenticação
 * - Card, CardHeader, CardTitle, etc - Componentes UI do shadcn/ui
 * - Building2 - Ícone do lucide-react
 * 
 * @params
 * - tenant_slug (URL) - Identificador único do tenant
 * - next (URL) - Caminho para redirecionamento após login
 * 
 * @flows
 * 1. Usuário insere CPF com formatação automática
 * 2. Submit do formulário chama authService.login
 * 3. Redirecionamento baseado em:
 *    - Se existe tenant_slug e next: redireciona para next
 *    - Se existe apenas tenant_slug: redireciona para dashboard do tenant
 *    - Caso contrário: redireciona para dashboard padrão
 * 
 * @modifications
 * Para modificar o comportamento do login:
 * - Alterar formatCPF() para mudar validação/formatação do CPF
 * - Modificar handleLogin() para alterar lógica de autenticação
 * - Ajustar rotas de redirecionamento em handleLogin()
 * - Customizar UI alterando componentes do Card
 * 
 * @error
 * Erros de login são logados no console, mas interface permanece funcional
 * 
 * @see
 * - authService.login()
 * - CandidateButton - Componente relacionado para acesso de candidatos
 */
export default function LoginPage() {
  const [cpf, setCpf] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantSlugFromQuery = searchParams.get("tenant_slug")
  const nextPath = searchParams.get("next")

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    if (formatted.length <= 14) {
      setCpf(formatted)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authService.login(cpf)
      if (tenantSlugFromQuery && nextPath) {
        router.push(nextPath) // nextPath should already include the tenantSlug
      } else if (tenantSlugFromQuery) {
        router.push(`/${tenantSlugFromQuery}/dashboard`)
      } else {
        // Fallback: In a real app, you might redirect to a tenant selection page
        // or a default tenant associated with the user. For now, mock a default.
        router.push("/smarted-tenant/dashboard") // Example default tenant slug
      }
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Sistema de Recrutamento IA</CardTitle>
          <CardDescription>Entre com seu CPF para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="w-full border-t my-2"></div>
          <CandidateButton />
        </CardFooter>
      </Card>
    </div>
  )
}
