// components/dashboard/DashboardHeader.tsx
import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ShareDialog } from "@/components/share-dialog"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"
import { DashboardData } from "@/types/dashboard-interface"
import { toast } from "@/components/ui/use-toast"

interface DashboardHeaderProps {
  tenantSlug: string
  period: "7d" | "30d" | "90d"
  setPeriod: (value: "7d" | "30d" | "90d") => void
  data: DashboardData
}

export function DashboardHeader({ tenantSlug, period, setPeriod, data }: DashboardHeaderProps) {
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      if (format === "pdf") {
        await exportToPDF(data, tenantSlug, period)
        toast({ title: "Sucesso", description: "Relatório PDF gerado com sucesso." })
      } else {
        await exportToExcel(data, tenantSlug, period)
        toast({ title: "Sucesso", description: "Relatório Excel gerado com sucesso." })
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar o relatório.", variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de recrutamento ({tenantSlug}).</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
        <ShareDialog
          title="Compartilhar Dashboard"
          resourceType="report"
          resourceId="dashboard-general"
          resourceName="Dashboard Geral"
          tenantSlug={tenantSlug}
        />
        <Button variant="outline" onClick={() => handleExport("pdf")}>
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
        <Button variant="outline" onClick={() => handleExport("excel")}>
          <Download className="mr-2 h-4 w-4" /> Exportar Excel
        </Button>
      </div>
    </div>
  )
}