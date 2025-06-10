// components/dashboard/UserActivityChart.tsx
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { UserActivityData } from "@/types/dashboard-interface"

interface UserActivityChartProps {
  data: UserActivityData[]
}

export function UserActivityChart({ data }: UserActivityChartProps) {
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