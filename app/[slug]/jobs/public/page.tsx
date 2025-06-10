"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Briefcase, Calendar, Users } from "lucide-react"
import Link from "next/link"
import type { Job } from "@/types"

// Mock jobs
const mockPublicJobs: Job[] = [
  {
    _id: "1",
    slug: "desenvolvedor-frontend-senior",
    title: "Desenvolvedor Frontend Sênior",
    description: "Buscamos um desenvolvedor frontend experiente para liderar projetos em React e TypeScript...",
    status: "aberta",
    candidatesCount: 23,
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-20"),
    createdBy: "joao-silva-abc123",
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 30, skills: 30, certifications: 15, behavioral: 15, leadership: 10 },
  },
  {
    _id: "2",
    slug: "analista-dados-junior",
    title: "Analista de Dados Júnior",
    description: "Estamos procurando um analista de dados júnior para trabalhar com nossa equipe de BI...",
    status: "aberta",
    candidatesCount: 12,
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-05-10"),
    createdBy: "maria-santos-xyz789",
    competencies: [],
    questions: [],
    isPCDExclusive: true,
    isReferralJob: false,
    criteriaWeights: { experience: 20, skills: 40, certifications: 20, behavioral: 10, leadership: 10 },
  },
]

export default function PublicJobsPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    const fetchJobs = async () => {
      setLoading(true)
      try {
        // Em uma implementação real, você faria uma chamada de API aqui
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular delay de rede
        setJobs(mockPublicJobs)
      } catch (error) {
        console.error("Erro ao carregar vagas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [tenantSlug])

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vagas Disponíveis</h1>
        <p className="text-muted-foreground">Confira as oportunidades abertas e candidate-se</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar vagas por título, descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  {job.isPCDExclusive && <Badge className="bg-blue-500">Exclusiva PCD</Badge>}
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3">{job.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.candidatesCount} candidatos
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.status === "aberta" ? "Vaga Aberta" : "Em Processo"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/apply/${job.slug}`}>Candidatar-se</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/${tenantSlug}/jobs/${job.slug}/public`}>Ver Detalhes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma vaga encontrada com os filtros atuais.</p>
          {searchTerm && (
            <Button variant="link" onClick={() => setSearchTerm("")}>
              Limpar busca
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
