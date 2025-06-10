"use client"

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

export default async function TenantAppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
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
