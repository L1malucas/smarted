"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"
import type { Job, JobStatus } from "@/types"
import { toast } from "@/components/ui/use-toast"
import { useParams } from "next/navigation"
import { JobCard } from "@/components/job-card"

const mockJobs: Job[] = [
  {
    _id: "1",
    slug: "desenvolvedor-frontend-senior",
    title: "Desenvolvedor Frontend Sênior",
    description: "Buscamos um desenvolvedor frontend experiente para liderar projetos em React e TypeScript...",
    status: "recrutamento",
    candidatesCount: 23,
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-20"),
    createdBy: "joao-silva-abc123",
    createdByName: "João Silva",
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 30, skills: 30, certifications: 15, behavioral: 15, leadership: 10 },
    statusChangeLog: [
      {
        status: "aberta",
        changedAt: new Date("2024-05-15"),
        changedBy: "joao-silva-abc123",
        changedByName: "João Silva",
      },
      {
        status: "recrutamento",
        changedAt: new Date("2024-05-20"),
        changedBy: "joao-silva-abc123",
        changedByName: "João Silva",
      },
    ],
  },
  // ... (adicione mais vagas mock aqui)
]

const jobStatusOptions: { value: JobStatus; label: string }[] = [
  { value: "aberta", label: "Aberta" },
  { value: "recrutamento", label: "Recrutamento" },
  { value: "triagem", label: "Triagem" },
  { value: "avaliação", label: "Avaliação" },
  { value: "contato", label: "Contato" },
  { value: "vaga fechada", label: "Vaga Fechada" },
  { value: "draft", label: "Rascunho" },
]

export default function JobsPage() {
  const [jobs, setJobsState] = useState<Job[]>(mockJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all")
  const [viewMode, setViewMode] = useState<"card" | "list">("card")

  const params = useParams()
  const tenantSlug = params.slug as string

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    setJobsState((prevJobs) =>
      prevJobs.map((job) => {
        if (job._id === jobId) {
          const updatedJob = {
            ...job,
            status: newStatus,
            updatedAt: new Date(),
            lastStatusUpdateBy: "current-user-slug", // Substituir pelo slug do usuário atual
            lastStatusUpdateByName: "Usuário Atual", // Substituir pelo nome do usuário atual
            statusChangeLog: [
              ...(job.statusChangeLog || []),
              {
                status: newStatus,
                changedAt: new Date(),
                changedBy: "current-user-slug",
                changedByName: "Usuário Atual",
              },
            ],
          }
          // Mock API call
          console.log(`Atualizando status da vaga ${jobId} para ${newStatus}`)
          toast({ title: "Status da Vaga Atualizado", description: `Vaga "${job.title}" movida para ${newStatus}.` })
          return updatedJob
        }
        return job
      }),
    )
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Vagas</h1>
          <p className="text-muted-foreground">Crie, edite e gerencie o status das suas vagas</p>
        </div>
        <Link href={`/${tenantSlug}/jobs/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vagas por título, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as JobStatus | "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {jobStatusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("card")}
            className={viewMode === "card" ? "bg-muted" : ""}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-layout-grid"
            >
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-muted" : ""}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-list"
            >
              <line x1="8" x2="21" y1="6" y2="6" />
              <line x1="8" x2="21" y1="12" y2="12" />
              <line x1="8" x2="21" y1="18" y2="18" />
              <line x1="3" x2="3.01" y1="6" y2="6" />
              <line x1="3" x2="3.01" y1="12" y2="12" />
              <line x1="3" x2="3.01" y1="18" y2="18" />
            </svg>
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
          </Button>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} tenantSlug={tenantSlug} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vagas</CardTitle>
            <CardDescription>Visualização em lista de todas as vagas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredJobs.map((job) => (
                <div key={job._id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <Link href={`/${tenantSlug}/jobs/${job.slug}/details`} className="font-medium hover:text-blue-500">
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {job.candidatesCount} candidatos • Criada em{" "}
                        {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={job.status}
                      onValueChange={(newStatus) => handleStatusChange(job._id, newStatus as JobStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} disabled={opt.value === job.status}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${tenantSlug}/jobs/${job.slug}/details`}>Ver Detalhes</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredJobs.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <p className="text-muted-foreground">Nenhuma vaga encontrada com os filtros atuais.</p>
          {searchTerm && (
            <Button variant="link" onClick={() => setSearchTerm("")}>
              Limpar busca
            </Button>
          )}
          {statusFilter !== "all" && (
            <Button variant="link" onClick={() => setStatusFilter("all")}>
              Limpar filtro de status
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
