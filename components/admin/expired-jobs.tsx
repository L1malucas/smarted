// components/admin/ExpiredJobs.tsx
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExpiredJobs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Vagas Expiradas ou Inativas</CardTitle>
        <CardDescription>
          Visualize e gerencie vagas que não estão mais ativas no processo de recrutamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-muted-foreground">Nenhuma vaga expirada ou inativa encontrada.</p>
        </div>
      </CardContent>
    </Card>
  )
}