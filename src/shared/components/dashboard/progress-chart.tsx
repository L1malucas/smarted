// components/dashboard/ProgressChart.tsx
"use client";

import { getDashboardMetrics } from "@/infrastructure/actions/dashboard-actions";
import React, { useState, useEffect, useTransition } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { IProgressChartProps } from "@/shared/types/types/component-props";

export function ProgressChart({ tenantSlug, period }: IProgressChartProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getDashboardMetrics(tenantSlug);
        if (result.success) {
          // ProgressChart expects an array of data, so we need to adapt the single metrics object
          // For now, we'll create a dummy array or use a more detailed metrics action if available
          setMetrics([result.data]); // Assuming getDashboardMetrics returns a single object
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
          <LineChart data={data}>
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