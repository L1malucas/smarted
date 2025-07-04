// components/dashboard/MetricsCards.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Target, PhoneForwarded, AlertTriangle, Loader2 } from "lucide-react";
import { getDashboardMetrics } from "@/actions/dashboard-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardsProps {
  tenantSlug: string;
  period: "7d" | "30d" | "90d";
}

export function MetricsCards({ tenantSlug, period }: MetricsCardsProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getDashboardMetrics(tenantSlug);
        if (result.success) {
          setMetrics(result.data);
        } else {
          setMetrics(null); // Handle error case
        }
        setIsLoading(false);
      });
    };
    fetchMetrics();
  }, [tenantSlug, period]);

  const displayValue = (value: number | undefined) => value || 0;

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }

  const { totalVagasCriadas, totalCandidatos, totalContatos, totalMatches, totalAcoesPendentes } = metrics;

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