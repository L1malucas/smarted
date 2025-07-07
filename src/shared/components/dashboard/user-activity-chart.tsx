import { getUserActivityChartDataAction } from "@/infrastructure/actions/dashboard-actions";
import React, { useState, useEffect, useTransition } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { IUserActivityChartProps } from "@/shared/types/types/component-props";
import { IUserActivityData } from "@/shared/types/types/dashboard-interface";

export function UserActivityChart({ tenantSlug, period }: IUserActivityChartProps) {
  const [activityData, setActivityData] = useState<IUserActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getUserActivityChartDataAction(tenantSlug, period);
        if (result.success && result.data) {
          setActivityData(result.data);
        } else {
          setActivityData([]); // Handle error case
        }
        setIsLoading(false);
      });
    };
    fetchActivityData();
  }, [tenantSlug, period]);

  if (isLoading) {
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
          <BarChart data={activityData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="logins" name="Logins" fill="#3B82F6" />
            <Bar dataKey="acoes" name="Ações no Sistema" fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}