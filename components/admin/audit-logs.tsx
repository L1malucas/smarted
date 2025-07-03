// components/admin/AuditLogs.tsx
import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { AccessLog, AllowedCPF } from "@/types/admin-interface"
import { AuditLogsProps } from "@/types/component-props"

export default function AuditLogs({ accessLogs, allowedCPFs }: AuditLogsProps) {
  const [auditUserFilter, setAuditUserFilter] = useState<string>("all")
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all")

  const filteredAuditLogs = accessLogs.filter((log) => {
    const matchesUser = auditUserFilter === "all" || log.cpf === auditUserFilter
    const matchesAction = auditActionFilter === "all" || log.action === auditActionFilter
    return matchesUser && matchesAction
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Auditoria do Sistema</CardTitle>
        <CardDescription>Acompanhe todas as ações importantes realizadas no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="flex-grow space-y-1">
            <Label htmlFor="audit-user">Usuário</Label>
            <Select value={auditUserFilter} onValueChange={setAuditUserFilter}>
              <SelectTrigger id="audit-user">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Usuários</SelectItem>
                {allowedCPFs.map((u) => (
                  <SelectItem key={u.cpf} value={u.cpf}>
                    {u.name} ({u.cpf})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow space-y-1">
            <Label htmlFor="audit-action">Tipo de Ação</Label>
            <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
              <SelectTrigger id="audit-action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Ações</SelectItem>
                {["User Added", "User Removed"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
          </Button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredAuditLogs.map((log) => (
            <div key={log.id} className="p-3 border rounded-md text-sm">
              <p>
                <strong className="font-medium">{log.name}</strong> ({log.cpf}) realizou a ação{" "}
                <Badge variant="outline">{log.action}</Badge>.
              </p>
              <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString("pt-BR")}</p>
            </div>
          ))}
          {filteredAuditLogs.length === 0 && (
            <p className="text-muted-foreground">Nenhum log encontrado com os filtros atuais.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}