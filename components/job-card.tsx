/**
 * Componente para exibir um cartão de vaga de emprego.
 * 
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.job - Objeto contendo os dados da vaga
 * @param {string} props.job._id - ID único da vaga
 * @param {string} props.job.title - Título da vaga
 * @param {string} props.job.slug - Slug da URL da vaga
 * @param {string} props.job.description - Descrição da vaga
 * @param {JobStatus} props.job.status - Status atual da vaga ('aberta' | 'recrutamento' | 'triagem' | 'avaliação' | 'contato' | 'vaga fechada' | 'draft')
 * @param {number} props.job.candidatesCount - Número de candidatos na vaga
 * @param {string} props.job.createdAt - Data de criação da vaga
 * @param {string} props.job.createdByName - Nome de quem criou a vaga
 * @param {string} props.job.lastStatusUpdateByName - Nome de quem atualizou o status por último
 * @param {string} props.tenantSlug - Slug do tenant/empresa para construção das URLs
 * @param {Function} props.onStatusChange - Callback executada quando o status da vaga é alterado
 * 
 * @example
 * ```tsx
 * <JobCard 
 *   job={jobData}
 *   tenantSlug="empresa-xyz"
 *   onStatusChange={(id, newStatus) => handleStatusChange(id, newStatus)}
 * />
 * ```
 * 
 * @remarks
 * O componente renderiza um card com:
 * - Título da vaga com link para detalhes
 * - Menu dropdown com ações (ver detalhes, editar, duplicar, compartilhar, excluir)
 * - Badge indicando o status atual
 * - Descrição da vaga
 * - Informações como número de candidatos, data de criação e últimas alterações
 * - Seletor para alteração de status
 * - Botão de ver detalhes no rodapé
 * 
 * @dependencies
 * - Requer componentes do shadcn/ui (Card, Badge, Button, Select, etc)
 * - Usa ícones do lucide-react
 * - Integra com componente ShareDialog para compartilhamento
 * - Utiliza react-router/Next.js para navegação via Link
 */

"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Users, Calendar, Eye, Edit, Copy, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ShareDialog } from "@/components/share-dialog"
import type { Job, JobStatus } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JobCardProps {
  job: Job
  tenantSlug: string
  onStatusChange: (jobId: string, newStatus: JobStatus) => void
}

export function JobCard({ job, tenantSlug, onStatusChange }: JobCardProps) {
  const getStatusBadge = (status: JobStatus) => {
    const statusConfig = {
      aberta: { variant: "default", label: "Aberta", className: "bg-sky-500 hover:bg-sky-600" },
      recrutamento: { variant: "default", label: "Recrutamento", className: "bg-blue-500 hover:bg-blue-600" },
      triagem: { variant: "default", label: "Triagem", className: "bg-indigo-500 hover:bg-indigo-600" },
      avaliação: { variant: "default", label: "Avaliação", className: "bg-purple-500 hover:bg-purple-600" },
      contato: { variant: "default", label: "Contato", className: "bg-pink-500 hover:bg-pink-600" },
      "vaga fechada": { variant: "destructive", label: "Fechada", className: "bg-slate-700 hover:bg-slate-800" },
      draft: { variant: "secondary", label: "Rascunho", className: "bg-gray-500 hover:bg-gray-600" },
    } as const
    const config = statusConfig[status] || { variant: "outline", label: status, className: "" }
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl hover:text-blue-500">
            <Link href={`/${tenantSlug}/jobs/${job.slug}/details`}>{job.title}</Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/${tenantSlug}/jobs/${job.slug}/details`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${tenantSlug}/jobs/${job.slug}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Vaga
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ShareDialog
                title={`Compartilhar Vaga: ${job.title}`}
                resourceType="job"
                resourceId={job._id}
                resourceName={job.title}
                tenantSlug={tenantSlug}
                jobSlug={job.slug}
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Vaga
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {getStatusBadge(job.status)}
        <CardDescription className="line-clamp-2 pt-2">{job.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {job.candidatesCount} candidatos
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Criada em: {new Date(job.createdAt).toLocaleDateString("pt-BR")}
          </div>
          {job.createdByName && <div className="text-xs">Por: {job.createdByName}</div>}
          {job.lastStatusUpdateByName && (
            <div className="text-xs">Última alteração de status por: {job.lastStatusUpdateByName}</div>
          )}
        </div>
        <div>
          <Select value={job.status} onValueChange={(newStatus) => onStatusChange(job._id, newStatus as JobStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Alterar status" />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "aberta", label: "Aberta" },
                { value: "recrutamento", label: "Recrutamento" },
                { value: "triagem", label: "Triagem" },
                { value: "avaliação", label: "Avaliação" },
                { value: "contato", label: "Contato" },
                { value: "vaga fechada", label: "Vaga Fechada" },
                { value: "draft", label: "Rascunho" },
              ].map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.value === job.status}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <div className="p-4 border-t">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/${tenantSlug}/jobs/${job.slug}/details`}>Ver Detalhes</Link>
        </Button>
      </div>
    </Card>
  )
}
