// components/dashboard/MetricsCards.tsx
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Target, PhoneForwarded, AlertTriangle } from "lucide-react"
import { MetricsData } from "@/types/dashboard-interface"

interface MetricsCardsProps {
  data: MetricsData[]
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const totalVagasCriadas = data.reduce((sum, item) => sum + item.vagasCriadas, 0)
  const totalCandidatos = data.reduce((sum, item) => sum + item.candidatosCadastrados, 0)
  const totalContatos = data.reduce((sum, item) => sum + item.contatosRealizados, 0)
  const totalMatches = data.reduce((sum, item) => sum + item.matches, 0)
  const totalAcoesPendentes = data.reduce((sum, item) => sum + item.acoesPendentes, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vagas Criadas</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVagasCriadas}</div>
          <p className="text-xs text-muted-foreground">Total de vagas abertas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Candidatos Cadastrados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCandidatos}</div>
          <p className="text-xs text-muted-foreground">Total de inscritos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contatos Realizados</CardTitle>
          <PhoneForwarded className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalContatos}</div>
          <p className="text-xs text-muted-foreground">Interações realizadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Matches Gerados</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMatches}</div>
          <p className="text-xs text-muted-foreground">Compatibilidades encontradas</p>
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
  )
}