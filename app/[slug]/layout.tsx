
import type React from "react"
import { Navbar } from "@/components/navbar"
import { authService } from "@/services/auth" // Mock auth service
import { redirect } from "next/navigation"
import { TenantProvider } from "@/contexts/tenant-context"

// Helper to get tenant data, in a real app this might involve validation
async function getTenantData(slug: string) {
  // For now, just return the slug if it looks reasonable.
  // In a real app, you'd validate this slug against a database of tenants.
  if (slug && slug.length > 3) {
    return { id: slug, name: `Tenant ${slug}` } // Mock tenant data
  }
  return null
}

/**
 * Layout do aplicativo específico para um tenant (inquilino).
 * 
 * @description
 * Este componente serve como layout base para todas as páginas dentro do contexto de um tenant específico.
 * Ele realiza verificações de autenticação e validação do tenant antes de renderizar o conteúdo.
 * 
 * @param props - Propriedades do componente
 * @param props.children - Conteúdo filho a ser renderizado dentro do layout
 * @param props.params - Promise contendo os parâmetros da rota, incluindo o slug do tenant
 * @param props.params.slug - Identificador único do tenant na URL
 * 
 * @throws {Redirect} Redireciona para "/login" se:
 * - O tenant não for encontrado (com query param error=invalid_tenant)
 * - O usuário não estiver autenticado (com query params tenant_slug e next)
 * 
 * @requires getTenantData - Função para buscar dados do tenant
 * @requires authService.getCurrentUser - Serviço de autenticação para obter usuário atual
 * @requires TenantProvider - Contexto para prover dados do tenant
 * @requires Navbar - Componente de navegação
 * 
 * @example
 * Uso em páginas:
 * ```
 * // /[slug]/dashboard/page.tsx
 * export default function DashboardPage() {
 *   return <div>Dashboard Content</div>
 * }
 * ```
 */
export default async function TenantAppLayout({
  children,
  params: paramsPromise, // Rename to avoid confusion
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }> // Type as Promise
}) {
  // Resolve the params Promise
  const params = await paramsPromise
  const tenant = await getTenantData(params.slug)
  const currentUser = await authService.getCurrentUser() // Mock current user

  if (!tenant) {
    // If tenant slug is invalid, redirect to a generic error or login
    redirect("/login?error=invalid_tenant")
  }

  if (!currentUser) {
    // If user is not authenticated, redirect to login, possibly with tenant info
    redirect(`/login?tenant_slug=${params.slug}&next=/${params.slug}/dashboard`)
  }

  return (
    <TenantProvider>
      <Navbar tenantSlug={params.slug} user={currentUser} />
      <main className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </TenantProvider>
  )
}