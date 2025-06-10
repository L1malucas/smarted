// components/dashboard/DashboardPage.tsx
"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams } from "next/navigation"
import { dashboardService } from "@/services/dashboard"
import { DashboardData } from "@/types/dashboard-interface"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { UserActivityChart } from "@/components/dashboard/user-activity-chart"

export default function DashboardPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")
  const [data, setData] = useState<DashboardData>({ metrics: [], userActivity: [] })

  useEffect(() => {
    const fetchData = async () => {
      const metrics = await dashboardService.getMetrics(tenantSlug, period)
      const userActivity = await dashboardService.getUserActivity(tenantSlug, period)
      setData({ metrics, userActivity })
    }
    fetchData()
  }, [tenantSlug, period])

  return (
    <div className="space-y-6">
      <DashboardHeader tenantSlug={tenantSlug} period={period} setPeriod={setPeriod} data={data} />
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <MetricsCards data={data.metrics} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart data={data.metrics} />
            <UserActivityChart data={data.userActivity} />
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="text-muted-foreground">Em desenvolvimento: análises detalhadas e insights.</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}