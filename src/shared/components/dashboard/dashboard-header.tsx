import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button";
import React, { useState } from "react"
import { exportToPDF, exportToExcel } from "@/shared/lib/export-utils";
import { DashboardData } from "@/shared/types/types/dashboard-interface";
import { Download } from "lucide-react";
import { ShareDialog } from "../share-dialog";
import { useToast } from "../ui/use-toast";

interface DashboardHeaderProps {
  tenantSlug: string
  period: "7d" | "30d" | "90d"
  setPeriod: (value: "7d" | "30d" | "90d") => void
  data: DashboardData
}

export function DashboardHeader({ tenantSlug, period, setPeriod, data }: DashboardHeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState<null | "pdf" | "excel">(null)
  const { toast } = useToast()

  const logoPath = "/logo.png"
  const headerText = "Dashboard Report"

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      if (format === "pdf") {
        await exportToPDF(data, tenantSlug, period, logoPath, headerText)
        toast({ title: "Sucesso", description: "Relatório PDF gerado com sucesso." })
      } else {
        await exportToExcel(data, tenantSlug, period)
        toast({ title: "Sucesso", description: "Relatório Excel gerado com sucesso." })
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar o relatório." +error, variant: "destructive" })
    }
    setConfirmOpen(null)
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
        <Button variant="outline" onClick={() => setConfirmOpen("pdf")}>
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
        <Button variant="outline" onClick={() => setConfirmOpen("excel")}>
          <Download className="mr-2 h-4 w-4" /> Exportar Excel
        </Button>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80">
          <div className="rounded-lg shadow-lg p-6 max-w-sm w-full bg-background">
            <h2 className="text-lg font-semibold mb-2">Confirmar exportação</h2>
            <p className="mb-4">
              Tem certeza que deseja exportar o relatório em formato {confirmOpen === "pdf" ? "PDF" : "Excel"}?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => handleExport(confirmOpen)}
                variant={"default"}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}