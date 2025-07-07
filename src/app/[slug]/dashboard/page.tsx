// components/dashboard/DashboardPage.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/shared/components/dashboard/dashboard-header"
import { MetricsCards } from "@/shared/components/dashboard/metrics-cards"
import { ProgressChart } from "@/shared/components/dashboard/progress-chart"
import { UserActivityChart } from "@/shared/components/dashboard/user-activity-chart"

export default function DashboardPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  return (
    <div className="space-y-6">
      <DashboardHeader tenantSlug={tenantSlug} period={period} setPeriod={setPeriod} data={undefined}/>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
            <>
              <MetricsCards tenantSlug={tenantSlug} period={period} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart tenantSlug={tenantSlug} period={period} />
                <UserActivityChart tenantSlug={tenantSlug} period={period} />
              </div>
            </>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="text-muted-foreground">Em desenvolvimento: análises detalhadas e insights.</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}