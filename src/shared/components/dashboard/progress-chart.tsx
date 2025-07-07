// components/dashboard/ProgressChart.tsx
"use client";

import { getDashboardMetrics } from "@/infrastructure/actions/dashboard-actions";
import React, { useState, useEffect, useTransition } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { IProgressChartProps } from "@/shared/types/types/component-props";

export function ProgressChart({ tenantSlug, period }: IProgressChartProps) {
  const [metrics, setMetrics] = useState<IProgressChartDataItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getDashboardMetrics(tenantSlug);
        if (result.success) {
          setMetrics([
            {
              name: "Total",
              vagasCriadas: result.data.totalVagasCriadas,
              candidatosCadastrados: result.data.totalCandidatos,
              contatosRealizados: result.data.totalContatos,
            },
          ]);
        } else {
          setMetrics(null); // Handle error case
        }
        setIsLoading(false);
      });
    };
    fetchMetrics();
  }, [tenantSlug, period]);

  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso Mensal</CardTitle>
          <CardDescription>Vagas, Candidatos e Contatos por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso Mensal</CardTitle>
        <CardDescription>Vagas, Candidatos e Contatos por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics}>
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
  )
}