// components/admin/SystemSettings.tsx
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SystemMetrics } from "@/types/admin-interface"

interface SystemSettingsProps {
  systemMetrics: SystemMetrics | null
}

export default function SystemSettings({ systemMetrics }: SystemSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Em desenvolvimento. Aqui estarão configurações como integrações, templates de email, etc.
        </p>
        {systemMetrics && (
          <div className="mt-4 space-y-2">
            <p><strong>Total de Usuários:</strong> {systemMetrics.totalUsers}</p>
            <p><strong>Usuários Ativos:</strong> {systemMetrics.activeUsers}</p>
            <p><strong>Total de Vagas:</strong> {systemMetrics.totalJobs}</p>
            <p><strong>Total de Candidatos:</strong> {systemMetrics.totalCandidates}</p>
            <p><strong>Uptime do Sistema:</strong> {systemMetrics.systemUptime}</p>
            <p><strong>Tempo Médio de Resposta:</strong> {systemMetrics.avgResponseTime}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}