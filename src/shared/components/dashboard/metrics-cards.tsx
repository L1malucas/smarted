// components/dashboard/MetricsCards.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Users, Briefcase,  } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { IMetricsCardsProps } from "@/shared/types/types/component-props";
import { ISystemMetrics } from "@/shared/types/types/dashboard-interface";
import { getPublicDashboardMetricsAction } from "@/infrastructure/actions/dashboard-actions";

export function MetricsCards({ tenantSlug, period }: IMetricsCardsProps) {
  const [metrics, setMetrics] = useState<ISystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getPublicDashboardMetricsAction(tenantSlug, period);
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

  const { totalUsers, totalJobs, totalCandidates } = metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue(totalUsers)}</div>
          <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue(totalJobs)}</div>
          <p className="text-xs text-muted-foreground">Vagas criadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Candidatos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue(totalCandidates)}</div>
          <p className="text-xs text-muted-foreground">Candidatos no sistema</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Uptime do Sistema</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.systemUptime}</div>
          <p className="text-xs text-muted-foreground">Disponibilidade do sistema</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgResponseTime}</div>
          <p className="text-xs text-muted-foreground">Performance da API</p>
        </CardContent>
      </Card>
    </div>
  )
}