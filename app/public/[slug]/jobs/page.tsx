"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Briefcase, Calendar, Users, MapPin, Clock, Building } from "lucide-react"
import Link from "next/link"
import type { Job } from "@/types"

// Mock jobs data
const mockPublicJobs: Job[] = [
  {
    _id: "1",
    slug: "desenvolvedor-frontend-senior",
    title: "Desenvolvedor Frontend Sênior",
    description:
      "Buscamos um desenvolvedor frontend experiente para liderar projetos em React e TypeScript. Você trabalhará em uma equipe ágil, desenvolvendo interfaces modernas e responsivas para nossos produtos digitais.",
    status: "aberta",
    candidatesCount: 23,
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-20"),
    createdBy: "joao-silva-abc123",
    competencies: [
      { id: "1", name: "React", weight: 5, isMandatory: true },
      { id: "2", name: "TypeScript", weight: 4, isMandatory: true },
      { id: "3", name: "CSS/SASS", weight: 3, isMandatory: false },
    ],
    questions: [
      { id: "q1", text: "Qual sua experiência com React?", type: "open" },
      {
        id: "q2",
        text: "Você tem experiência com TypeScript?",
        type: "closed",
        options: ["Sim", "Não", "Parcialmente"],
      },
    ],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 30, skills: 30, certifications: 15, behavioral: 15, leadership: 10 },
  },
  {
    _id: "2",
    slug: "analista-dados-junior",
    title: "Analista de Dados Júnior",
    description:
      "Estamos procurando um analista de dados júnior para trabalhar com nossa equipe de BI. Você será responsável por extrair insights de dados e criar dashboards para apoiar decisões estratégicas.",
    status: "aberta",
    candidatesCount: 12,
    createdAt: new Date("2024-05-10"),
    updatedAt: new Date("2024-05-10"),
    createdBy: "maria-santos-xyz789",
    competencies: [
      { id: "4", name: "SQL", weight: 5, isMandatory: true },
      { id: "5", name: "Python", weight: 4, isMandatory: true },
      { id: "6", name: "Power BI", weight: 3, isMandatory: false },
    ],
    questions: [
      { id: "q3", text: "Descreva sua experiência com SQL", type: "open" },
      {
        id: "q4",
        text: "Qual ferramenta de visualização você prefere?",
        type: "closed",
        options: ["Power BI", "Tableau", "Looker", "Outras"],
      },
    ],
    isPCDExclusive: true,
    isReferralJob: false,
    criteriaWeights: { experience: 20, skills: 40, certifications: 20, behavioral: 10, leadership: 10 },
  },
  {
    _id: "3",
    slug: "designer-ux-ui",
    title: "Designer UX/UI",
    description:
      "Procuramos um designer criativo para criar experiências digitais excepcionais. Você trabalhará em projetos diversos, desde pesquisa de usuário até prototipagem e testes de usabilidade.",
    status: "aberta",
    candidatesCount: 8,
    createdAt: new Date("2024-05-12"),
    updatedAt: new Date("2024-05-12"),
    createdBy: "ana-costa-def456",
    competencies: [
      { id: "7", name: "Figma", weight: 5, isMandatory: true },
      { id: "8", name: "Design Thinking", weight: 4, isMandatory: true },
      { id: "9", name: "Prototipagem", weight: 3, isMandatory: false },
    ],
    questions: [
      { id: "q5", text: "Descreva seu processo de design", type: "open" },
      {
        id: "q6",
        text: "Qual ferramenta você usa para prototipagem?",
        type: "closed",
        options: ["Figma", "Sketch", "Adobe XD", "Outras"],
      },
    ],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 25, skills: 35, certifications: 10, behavioral: 20, leadership: 10 },
  },
]

export default function PublicJobsPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        // Simular carregamento de dados
        await new Promise((resolve) => setTimeout(resolve, 1000))
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Oportunidades de Carreira</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Descubra vagas que combinam com seu perfil e dê o próximo passo na sua carreira
        </p>
      </div>

      {/* Search */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por cargo, tecnologia, área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{jobs.length}</div>
            <div className="text-gray-600">Vagas Abertas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {jobs.reduce((acc, job) => acc + job.candidatesCount, 0)}
            </div>
            <div className="text-gray-600">Candidatos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {jobs.filter((job) => job.isPCDExclusive).length}
            </div>
            <div className="text-gray-600">Vagas PCD</div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-gray-600 mb-4">Tente ajustar os filtros de busca</p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            )}
          </div>
        )}

        {filteredJobs.map((job) => (
          <Card key={job._id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-gray-900 hover:text-blue-600 transition-colors">
                    <Link href={`/public/${tenantSlug}/jobs/${job.slug}`}>{job.title}</Link>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>Empresa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Remoto/Híbrido</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>CLT</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {job.isPCDExclusive && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Exclusiva PCD</Badge>
                  )}
                  <div className="text-sm text-gray-500">
                    Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 line-clamp-3 leading-relaxed">{job.description}</p>

              {/* Competências */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Principais competências:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.competencies.slice(0, 5).map((comp) => (
                    <Badge
                      key={comp.id}
                      variant={comp.isMandatory ? "default" : "secondary"}
                      className={comp.isMandatory ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {comp.name}
                      {comp.isMandatory && " *"}
                    </Badge>
                  ))}
                  {job.competencies.length > 5 && <Badge variant="outline">+{job.competencies.length - 5} mais</Badge>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{job.candidatesCount} candidatos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Vaga ativa</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" asChild>
                    <Link href={`/public/${tenantSlug}/jobs/${job.slug}`}>Ver Detalhes</Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href={`/public/${tenantSlug}/jobs/${job.slug}/apply`}>Candidatar-se</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
