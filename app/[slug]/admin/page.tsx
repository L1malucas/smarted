"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Shield, Settings, Archive, CalendarX, UserCog, History, Filter, LifeBuoy } from "lucide-react" // Added LifeBuoy
import type { Job, AuditLog, User as AppUser } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams } from "next/navigation"

// Mock data
const mockAllowedCPFs: AppUser[] = [
  {
    _id: "user1",
    cpf: "123.456.789-00",
    slug: "joao-silva",
    name: "João Silva",
    isAdmin: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
    roles: ["admin"],
    permissions: [],
  },
  {
    _id: "user2",
    cpf: "987.654.321-00",
    slug: "maria-santos",
    name: "Maria Santos",
    isAdmin: false,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date(),
    roles: ["recruiter"],
    permissions: [],
  },
]

const mockJobsForAdmin: Job[] = [
  {
    _id: "job1",
    title: "Vaga Expirada Exemplo",
    status: "vaga fechada",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-02-01"),
    expiresAt: new Date("2023-02-01"),
    createdBy: "user1",
    candidatesCount: 5,
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    slug: "vaga-expirada",
    criteriaWeights: { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
  },
  {
    _id: "job2",
    title: "Vaga Inativa Exemplo",
    status: "draft",
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-01"),
    createdBy: "user2",
    candidatesCount: 0,
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    slug: "vaga-inativa",
    criteriaWeights: { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    _id: "log1",
    timestamp: new Date(Date.now() - 3600000),
    userId: "joao-silva",
    userName: "João Silva",
    actionType: "login",
    resourceType: "system",
    details: "Usuário João Silva logou no sistema.",
  },
  {
    _id: "log2",
    timestamp: new Date(Date.now() - 7200000),
    userId: "maria-santos",
    userName: "Maria Santos",
    actionType: "create",
    resourceType: "job",
    resourceId: "dev-frontend",
    details: "Vaga 'Desenvolvedor Frontend' criada.",
  },
  {
    _id: "log3",
    timestamp: new Date(Date.now() - 10800000),
    userId: "joao-silva",
    userName: "João Silva",
    actionType: "status_change",
    resourceType: "job",
    resourceId: "dev-frontend",
    details: "Status da vaga 'Desenvolvedor Frontend' alterado para 'triagem'.",
  },
]

/**
 * @description Página de administração do sistema que permite gerenciar usuários, vagas expiradas, logs de auditoria e configurações
 * 
 * @component AdminPage
 * 
 * @remarks
 * Este componente utiliza o padrão de roteamento do Next.js com páginas dinâmicas ([slug])
 * 
 * @state
 * - newCPF: Armazena o CPF sendo digitado no formulário de novo usuário
 * - newName: Armazena o nome sendo digitado no formulário de novo usuário 
 * - newIsAdmin: Controla se o novo usuário terá privilégios de administrador
 * - auditDateRange: Filtro de período para os logs de auditoria
 * - auditUserFilter: Filtro de usuário para os logs de auditoria
 * - auditActionFilter: Filtro de tipo de ação para os logs de auditoria
 * 
 * @functions
 * - formatCPF: Formata string numérica para formato de CPF (000.000.000-00)
 * - handleCPFChange: Gerencia mudanças no input de CPF, aplicando formatação
 * - addCPF: Adiciona novo usuário ao sistema (atualmente apenas mock)
 * - filteredAuditLogs: Filtra logs de auditoria baseado nos filtros selecionados
 * 
 * @tabs
 * - users: Gerenciamento de usuários (adicionar/remover acesso, definir permissões)
 * - expired_jobs: Gestão de vagas expiradas ou inativas
 * - audit_logs: Visualização dos logs de auditoria do sistema
 * - support: Informações de suporte e contato
 * - system_settings: Configurações gerais do sistema (em desenvolvimento)
 * 
 * @todo
 * - Implementar integração real com backend para:
 *   - Gerenciamento de usuários
 *   - Logs de auditoria
 *   - Gestão de vagas
 * - Adicionar DatePickerWithRange no filtro de auditoria
 * - Implementar funcionalidades nas configurações do sistema
 * - Adicionar confirmação para exclusão de usuários/vagas
 * 
 * @dependencies
 * - useParams: Hook do Next.js para acessar parâmetros da URL
 * - Componentes UI: Card, Tabs, Button, Input, Switch, Badge, etc
 * - Icons: Shield, UserCog, CalendarX, History, etc
 * 
 * @example
 * URL de acesso: /[tenant-slug]/admin
 * Ex: /empresa-abc/admin
 */
export default function AdminPage() {
  const params = useParams()
  const tenantSlug = params.slug as string

  const [newCPF, setNewCPF] = useState("")
  const [newName, setNewName] = useState("")
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [auditDateRange, setAuditDateRange] = useState<any>(undefined)
  const [auditUserFilter, setAuditUserFilter] = useState<string>("all")
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all")

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    if (formatted.length <= 14) {
      setNewCPF(formatted)
    }
  }

  const addCPF = () => {
    if (newCPF && newName) {
      console.log("Adding CPF:", { cpf: newCPF, name: newName, isAdmin: newIsAdmin })
      setNewCPF("")
      setNewName("")
      setNewIsAdmin(false)
    }
  }

  const filteredAuditLogs = mockAuditLogs.filter((log) => {
    const matchesUser = auditUserFilter === "all" || log.userId === auditUserFilter
    const matchesAction = auditActionFilter === "all" || log.actionType === auditActionFilter
    return matchesUser && matchesAction
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerenciamento do sistema ({tenantSlug}), usuários e logs.</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="users">
            <UserCog className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="expired_jobs">
            <CalendarX className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Vagas Expiradas
          </TabsTrigger>
          <TabsTrigger value="audit_logs">
            <History className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="support">
            <LifeBuoy className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Suporte
          </TabsTrigger>
          <TabsTrigger value="system_settings">
            <Settings className="mr-2 h-4 w-4 inline-block sm:hidden lg:inline-block" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Usuário (CPF)</CardTitle>
              <CardDescription>Autorize novos usuários a acessar o sistema e defina permissões.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="000.000.000-00" value={newCPF} onChange={handleCPFChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Nome do usuário"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="admin" checked={newIsAdmin} onCheckedChange={setNewIsAdmin} />
                  <Label htmlFor="admin">Permissão de Administrador</Label>
                </div>
              </div>
              <Button onClick={addCPF} disabled={!newCPF || !newName}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usuários Autorizados ({mockAllowedCPFs.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAllowedCPFs.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {user.name}{" "}
                      {user.isAdmin && (
                        <Badge variant="destructive" className="ml-2">
                          Admin
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.cpf}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Criado em: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired_jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Vagas Expiradas ou Inativas</CardTitle>
              <CardDescription>
                Visualize e gerencie vagas que não estão mais ativas no processo de recrutamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add filters for status (expired, inactive/draft, closed) and date range */}
              <div className="space-y-3">
                {mockJobsForAdmin.map((job) => (
                  <div key={job._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {job.title}{" "}
                        <Badge variant={job.status === "vaga fechada" ? "destructive" : "secondary"}>
                          {job.status}
                        </Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criada em: {new Date(job.createdAt).toLocaleDateString()}, Por: {job.createdBy}
                      </p>
                      {job.expiresAt && (
                        <p className="text-xs text-red-500">
                          Expirou em: {new Date(job.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Archive className="mr-2 h-4 w-4" /> Arquivar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Permanentemente
                      </Button>
                    </div>
                  </div>
                ))}
                {mockJobsForAdmin.length === 0 && (
                  <p className="text-muted-foreground">Nenhuma vaga expirada ou inativa encontrada.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit_logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria do Sistema</CardTitle>
              <CardDescription>Acompanhe todas as ações importantes realizadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
                {/* <DatePickerWithRange date={auditDateRange} onDateChange={setAuditDateRange} /> */}
                <div className="flex-grow space-y-1">
                  <Label htmlFor="audit-user">Usuário</Label>
                  <Select value={auditUserFilter} onValueChange={setAuditUserFilter}>
                    <SelectTrigger id="audit-user">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Usuários</SelectItem>
                      {mockAllowedCPFs.map((u) => (
                        <SelectItem key={u.slug} value={u.slug}>
                          {u.name}
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
                      {/* Populate with AuditLog action types */}
                      {["create", "update", "delete", "login", "logout", "export", "share", "status_change"].map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
                </Button>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredAuditLogs.map((log) => (
                  <div key={log._id} className="p-3 border rounded-md text-sm">
                    <p>
                      <strong className="font-medium">{log.userName}</strong> ({log.userId}) realizou a ação{" "}
                      <Badge variant="outline">{log.actionType}</Badge> no recurso{" "}
                      <Badge variant="secondary">
                        {log.resourceType}
                        {log.resourceId ? ` (${log.resourceId})` : ""}
                      </Badge>
                      .
                    </p>
                    <p className="text-muted-foreground text-xs">{log.details}</p>
                    <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
                {filteredAuditLogs.length === 0 && (
                  <p className="text-muted-foreground">Nenhum log encontrado com os filtros atuais.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
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
              {/* Placeholder for a form if needed later */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system_settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em desenvolvimento. Aqui estarão configurações como integrações, templates de email, etc.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
