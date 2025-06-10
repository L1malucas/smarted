// components/admin/Support.tsx
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Support() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulo de Suporte</CardTitle>
        <CardDescription>Relate problemas ou tire dúvidas sobre o sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Para relatar um problema, por favor, envie um email para:{" "}
          <a href="mailto:suporte@smarted.com" className="text-blue-500 hover:underline">
            suporte@smarted.com
          </a>
        </p>
        <p>
          Você também pode consultar nossa{" "}
          <a href="#" className="text-blue-500 hover:underline">
            FAQ e Documentação
          </a>
          .
        </p>
      </CardContent>
    </Card>
  )
}