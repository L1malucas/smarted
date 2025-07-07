"use client";

import { getPublicDashboardMetricsAction } from "@/infrastructure/actions/dashboard-actions";
import React, { useState, useEffect, useTransition } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { IProgressChartProps } from "@/shared/types/types/component-props";
import { ISystemMetrics } from "@/shared/types/types/dashboard-interface";

// Helper to format data for the chart
const formatChartData = (metrics: ISystemMetrics | null) => {
  if (!metrics || !metrics.jobsCreated || !metrics.candidatesApplied) return [];

  const dataMap = new Map<string, { name: string; vagasCriadas: number; candidatos: number }>();

  // Process jobs created
  metrics.jobsCreated.forEach(item => {
    const month = new Date(item.date).toLocaleString('default', { month: 'short' });
    if (!dataMap.has(month)) {
      dataMap.set(month, { name: month, vagasCriadas: 0, candidatos: 0 });
    }
    dataMap.get(month)!.vagasCriadas += item.count;
  });

  // Process candidates applied
  metrics.candidatesApplied.forEach(item => {
    const month = new Date(item.date).toLocaleString('default', { month: 'short' });
    if (!dataMap.has(month)) {
      dataMap.set(month, { name: month, vagasCriadas: 0, candidatos: 0 });
    }
    dataMap.get(month)!.candidatos += item.count;
  });
  
  // Sort data by month (assuming a calendar year order)
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sortedData = Array.from(dataMap.values()).sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));

  return sortedData;
};


export function ProgressChart({ tenantSlug, period }: IProgressChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getPublicDashboardMetricsAction(tenantSlug, period);
        if (result.success && result.data) {
          const formattedData = formatChartData(result.data);
          setChartData(formattedData);
        } else {
          setChartData([]); // Handle error case
        }
        setIsLoading(false);
      });
    };
    fetchMetrics();
  }, [tenantSlug, period]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso Mensal</CardTitle>
          <CardDescription>Vagas criadas e novos candidatos por mês</CardDescription>
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
        <CardDescription>Vagas criadas e novos candidatos por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="vagasCriadas" name="Vagas Criadas" stroke="#8884d8" />
            <Line type="monotone" dataKey="candidatos" name="Candidatos" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}