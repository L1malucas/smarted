"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useParams } from "next/navigation"
import { ITenantContextType } from "@/shared/types/types/tenant-interface"

const TenantContext = createContext<ITenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const slug = params?.slug as string
    if (slug) {
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
