"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Briefcase, Target, PhoneForwarded, AlertTriangle, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { ShareDialog } from "@/components/share-dialog"
import { useParams } from "next/navigation" // Import useParams
import { toast } from "@/components/ui/use-toast"

const metricsData = [
  { name: "Jan", vagasCriadas: 5, candidatosCadastrados: 45, contatosRealizados: 10, matches: 12, acoesPendentes: 3 },
  { name: "Fev", vagasCriadas: 7, candidatosCadastrados: 52, contatosRealizados: 15, matches: 18, acoesPendentes: 5 },
  // ... more data
]

const userActivityData = [
  { name: "Seg", logins: 10, acoes: 50 },
  { name: "Ter", logins: 12, acoes: 60 },
  { name: "Qua", logins: 8, acoes: 40 },
  { name: "Qui", logins: 15, acoes: 75 },
  { name: "Sex", logins: 11, acoes: 55 },
]

export default function DashboardPage() {
  const params = useParams() // Get params
  const tenantSlug = params.slug as string // Extract tenantSlug

  const [period, setPeriod] = useState("30d")

  const totalVagasCriadas = metricsData.reduce((sum, item) => sum + item.vagasCriadas, 0)
  const totalCandidatos = metricsData.reduce((sum, item) => sum + item.candidatosCadastrados, 0)
  const totalContatos = metricsData.reduce((sum, item) => sum + item.contatosRealizados, 0)
  const totalMatches = metricsData.reduce((sum, item) => sum + item.matches, 0)
  const totalAcoesPendentes = metricsData.reduce((sum, item) => sum + item.acoesPendentes, 0)

  const handleExport = (format: "pdf" | "excel", scope: "vaga" | "etapa" | "geral") => {
    // Mock export functionality
    console.log(`Exporting ${scope} report in ${format} for tenant ${tenantSlug}`)
    toast({ title: "Exportação Iniciada (Simulado)", description: `Relatório ${scope} será gerado em ${format}.` })
  }

  return (
    <div className="space-y-6">
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
          <Button variant="outline" onClick={() => handleExport("pdf", "geral")}>
            <Download className="mr-2 h-4 w-4" /> Exportar PDF Geral
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel", "geral")}>
            <Download className="mr-2 h-4 w-4" /> Exportar Excel Geral
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {" "}
        {/* Changed to 5 cols for new metric */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Criadas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVagasCriadas}</div>
            <p className="text-xs text-muted-foreground">+5% vs período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatos Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidatos}</div>
            <p className="text-xs text-muted-foreground">+12% vs período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos Realizados</CardTitle>
            <PhoneForwarded className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContatos}</div>
            <p className="text-xs text-muted-foreground">+8% vs período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches Gerados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
            <p className="text-xs text-muted-foreground">+15% vs período anterior</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Ações Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalAcoesPendentes}</div>
            <p className="text-xs text-muted-foreground">Vagas/candidatos requerendo atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progresso Mensal</CardTitle>
            <CardDescription>Vagas, Candidatos e Contatos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="vagasCriadas" name="Vagas Criadas" stroke="#8884d8" />
                <Line type="monotone" dataKey="candidatosCadastrados" name="Candidatos" stroke="#82ca9d" />
                <Line type="monotone" dataKey="contatosRealizados" name="Contatos" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atividade do Usuário (Semanal)</CardTitle>
            <CardDescription>Logins e ações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="logins" name="Logins" fill="#3B82F6" />
                <Bar dataKey="acoes" name="Ações no Sistema" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Placeholder for other dashboard sections like "Insights e Recomendações" */}
    </div>
  )
}
