// components/dashboard/UserActivityChart.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getUserActivityData } from "@/actions/dashboard-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface UserActivityChartProps {
  tenantSlug: string;
  period: "7d" | "30d" | "90d";
}

export function UserActivityChart({ tenantSlug, period }: UserActivityChartProps) {
  const [activityData, setActivityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getUserActivityData(tenantSlug, period);
        if (result.success) {
          setActivityData(result.data);
        } else {
          setActivityData([]); // Handle error case
        }
        setIsLoading(false);
      });
    };
    fetchActivityData();
  }, [tenantSlug, period]);

  if (isLoading || activityData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade do Usuário (Semanal)</CardTitle>
          <CardDescription>Logins e ações realizadas no sistema</CardDescription>
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
        <CardTitle>Atividade do Usuário (Semanal)</CardTitle>
        <CardDescription>Logins e ações realizadas no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
  )
}