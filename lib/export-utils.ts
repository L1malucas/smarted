// lib/export-utils.ts
import { DashboardData } from "@/types/dashboard-interface"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"

export const exportToPDF = async (data: DashboardData, tenantSlug: string, period: string) => {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(`Dashboard Report - ${tenantSlug}`, 20, 20)
  doc.setFontSize(12)
  doc.text(`Period: ${period}`, 20, 30)

  // Metrics Summary
  const metrics = data.metrics.reduce(
    (acc, item) => ({
      vagasCriadas: acc.vagasCriadas + item.vagasCriadas,
      candidatosCadastrados: acc.candidatosCadastrados + item.candidatosCadastrados,
      contatosRealizados: acc.contatosRealizados + item.contatosRealizados,
      matches: acc.matches + item.matches,
      acoesPendentes: acc.acoesPendentes + item.acoesPendentes,
    }),
    { vagasCriadas: 0, candidatosCadastrados: 0, contatosRealizados: 0, matches: 0, acoesPendentes: 0 }
  )

  doc.text("Metrics Summary:", 20, 50)
  doc.text(`Vagas Criadas: ${metrics.vagasCriadas}`, 20, 60)
  doc.text(`Candidatos Cadastrados: ${metrics.candidatosCadastrados}`, 20, 70)
  doc.text(`Contatos Realizados: ${metrics.contatosRealizados}`, 20, 80)
  doc.text(`Matches Gerados: ${metrics.matches}`, 20, 90)
  doc.text(`Ações Pendentes: ${metrics.acoesPendentes}`, 20, 100)

  // User Activity
  doc.text("User Activity:", 20, 120)
  data.userActivity.forEach((item, index) => {
    doc.text(`${item.name}: ${item.logins} logins, ${item.acoes} ações`, 20, 130 + index * 10)
  })

  doc.save(`dashboard-${tenantSlug}-${period}.pdf`)
}

export const exportToExcel = async (data: DashboardData, tenantSlug: string, period: string) => {
  const wb = XLSX.utils.book_new()

  // Metrics Sheet
  const metricsWsData = [
    ["Mês", "Vagas Criadas", "Candidatos Cadastrados", "Contatos Realizados", "Matches", "Ações Pendentes"],
    ...data.metrics.map((item) => [
      item.name,
      item.vagasCriadas,
      item.candidatosCadastrados,
      item.contatosRealizados,
      item.matches,
      item.acoesPendentes,
    ]),
  ]
  const metricsWs = XLSX.utils.aoa_to_sheet(metricsWsData)
  XLSX.utils.book_append_sheet(wb, metricsWs, "Metrics")

  // User Activity Sheet
  const userActivityWsData = [
    ["Dia", "Logins", "Ações"],
    ...data.userActivity.map((item) => [item.name, item.logins, item.acoes]),
  ]
  const userActivityWs = XLSX.utils.aoa_to_sheet(userActivityWsData)
  XLSX.utils.book_append_sheet(wb, userActivityWs, "User Activity")

  XLSX.writeFile(wb, `dashboard-${tenantSlug}-${period}.xlsx`)
}