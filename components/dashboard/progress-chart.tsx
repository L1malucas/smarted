// components/dashboard/ProgressChart.tsx
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { MetricsData } from "@/types/dashboard-interface"

interface ProgressChartProps {
  data: MetricsData[]
}

export function ProgressChart({ data }: ProgressChartProps) {
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