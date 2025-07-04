// components/dashboard/MetricsCards.tsx
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Target, PhoneForwarded, AlertTriangle } from "lucide-react"
import { MetricsData } from "@/types/dashboard-interface"

interface MetricsCardsProps {
  data: {
    totalVagasCriadas: number;
    totalCandidatos: number;
    totalContatos: number;
    totalMatches: number;
    totalAcoesPendentes: number;
  };
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const { totalVagasCriadas, totalCandidatos, totalContatos, totalMatches, totalAcoesPendentes } = data || {};

  const displayValue = (value: number | undefined) => value || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vagas Criadas</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue(totalVagasCriadas)}</div>
          <p className="text-xs text-muted-foreground">Total de vagas abertas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Candidatos Cadastrados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue(totalCandidatos)}</div>
          <p className="text-xs text-muted-foreground">Total de inscritos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contatos Realizados</CardTitle>
          <PhoneForwarded className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue(totalContatos)}</div>
          <p className="text-xs text-muted-foreground">Interações realizadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Matches Gerados</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue(totalMatches)}</div>
          <p className="text-xs text-muted-foreground">Compatibilidades encontradas</p>
        </CardContent>
      </Card>
      <Card className="border-yellow-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-600">Ações Pendentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{displayValue(totalAcoesPendentes)}</div>
          <p className="text-xs text-muted-foreground">Vagas/candidatos requerendo atenção</p>
        </CardContent>
      </Card>
    </div>
  )
}