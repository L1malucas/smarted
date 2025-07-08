import type React from "react"
import { Navbar } from "@/shared/components/navbar"
import { redirect } from "next/navigation"
import { TenantProvider } from "@/shared/components/contexts/tenant-context"
import { LoadingProvider } from "@/shared/components/contexts/loading-context"
import { cookies } from 'next/headers';
import { verifyToken } from '@/infrastructure/auth/auth';

import { IUserSession } from "@/domain/models/User"
async function getTenantData(slug: string, currentUser: IUserSession | null) {
  if (currentUser && currentUser.tenantId === slug) {
    return { id: currentUser.tenantId, name: `Tenant ${currentUser.tenantId}` };
  }
  return null
}
export default async function TenantAppLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const params = await paramsPromise
  const accessToken = (await cookies()).get('accessToken')?.value;
  let currentUser: IUserSession | null = null;
  if (accessToken) {
    try {
      const decoded = await verifyToken(accessToken);
      if (decoded) {
        currentUser = decoded;
      }
    } catch (error) {
      // Erros de verificação de token são logados pelas actions de autenticação.
    }
  }
  const tenant = await getTenantData(params.slug, currentUser);
  if (!tenant) {
    redirect("/login?error=invalid_tenant")
  }
  if (!currentUser) {
    redirect(`/login?tenant_slug=${params.slug}&next=/${params.slug}/dashboard`)
  }
  return (
    <TenantProvider>
      <LoadingProvider>
        <Navbar tenantSlug={params.slug} user={currentUser} />
        <main className="min-h-[calc(100vh-4rem)] bg-background">
          <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </LoadingProvider>
    </TenantProvider>
  )
}