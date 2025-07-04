"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useParams } from "next/navigation"
import { TenantContextType } from "@/shared/types/types/tenant-interface"

const TenantContext = createContext<TenantContextType | undefined>(undefined)

/**
 * Provider para gerenciar informações do tenant (inquilino) na aplicação.
 * 
 * @component
 * @example
 * ```tsx
 * <TenantProvider>
 *   <App />
 * </TenantProvider>
 * ```
 * 
 * @description
 * Este componente utiliza o Context API do React para fornecer informações do tenant
 * para toda a árvore de componentes abaixo dele. Ele gerencia:
 * - O slug do tenant
 * - O nome do tenant
 * - Estado de carregamento
 * 
 * O componente obtém o slug do tenant através dos parâmetros da URL usando `useParams`
 * e simula uma chamada à API para buscar informações adicionais do tenant.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {ReactNode} props.children - Componentes filhos que terão acesso ao contexto
 * 
 * @context TenantContext
 * @provides {{
 *   tenantSlug: string | null,
 *   tenantName: string | null,
 *   isLoading: boolean,
 *   setTenantData: (slug: string, name: string) => void
 * }}
 * 
 * @note
 * Para modificar este componente no futuro:
 * 1. A simulação de API (setTimeout) deve ser substituída por uma chamada real
 * 2. Adicione validações adicionais para o slug se necessário
 * 3. Expanda o estado do tenant conforme necessidade (cores, logos, etc)
 * 4. Considere adicionar tratamento de erros para chamadas à API
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const slug = params?.slug as string
    if (slug) {
      // Em uma implementação real, você faria uma chamada de API para obter os dados do tenant
      // Simulando uma chamada de API
      setTimeout(() => {
        setTenantSlug(slug)
        setTenantName(`Tenant ${slug}`) // Nome fictício
        setIsLoading(false)
      }, 500)
    } else {
      setIsLoading(false)
    }
  }, [params])

  const setTenantData = (slug: string, name: string) => {
    setTenantSlug(slug)
    setTenantName(name)
  }

  return (
    <TenantContext.Provider value={{ tenantSlug, tenantName, isLoading, setTenantData }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
