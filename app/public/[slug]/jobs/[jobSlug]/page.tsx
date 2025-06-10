"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building, MapPin, Clock, Users, Calendar, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { Job } from "@/types"

// Mock job data - in a real app, fetch this by jobSlug
const mockJobData: Job = {
  _id: "1",
  slug: "desenvolvedor-frontend-senior",
  title: "Desenvolvedor Frontend Sênior",
  description: `Estamos buscando um Desenvolvedor Frontend Sênior para se juntar à nossa equipe de tecnologia. 

Você será responsável por:
• Desenvolver interfaces modernas e responsivas usando React e TypeScript
• Colaborar com designers e backend developers para criar experiências excepcionais
• Participar de code reviews e mentoria de desenvolvedores júnior
• Implementar testes automatizados e garantir a qualidade do código
• Trabalhar em metodologias ágeis (Scrum/Kanban)

O que oferecemos:
• Salário competitivo + benefícios
• Plano de saúde e odontológico
• Vale refeição e transporte
• Horário flexível e trabalho remoto
• Ambiente colaborativo e inovador
• Oportunidades de crescimento e desenvolvimento`,
  competencies: [
    { id: "1", name: "React", weight: 5, isMandatory: true },
    { id: "2", name: "TypeScript", weight: 5, isMandatory: true },
    { id: "3", name: "JavaScript ES6+", weight: 4, isMandatory: true },
    { id: "4", name: "CSS/SASS", weight: 3, isMandatory: false },
    { id: "5", name: "Git", weight: 3, isMandatory: false },
    { id: "6", name: "Jest/Testing", weight: 3, isMandatory: false },
    { id: "7", name: "Node.js", weight: 2, isMandatory: false },
  ],
  questions: [
    { id: "q1", text: "Descreva sua experiência com React e TypeScript", type: "open" },
    {
      id: "q2",
      text: "Você tem experiência com testes automatizados?",
      type: "closed",
      options: ["Sim, bastante", "Sim, pouca", "Não, mas tenho interesse", "Não"],
    },
    { id: "q3", text: "Qual sua pretensão salarial?", type: "open" },
    {
      id: "q4",
      text: "Você está disponível para trabalho remoto?",
      type: "closed",
      options: ["Sim, totalmente remoto", "Sim, híbrido", "Prefiro presencial"],
    },
  ],
  isPCDExclusive: false,
  isReferralJob: false,
  status: "aberta",
  candidatesCount: 23,
  createdAt: new Date("2024-05-15"),
  updatedAt: new Date("2024-05-20"),
  createdBy: "joao-silva-abc123",
  criteriaWeights: { experience: 30, skills: 30, certifications: 15, behavioral: 15, leadership: 10 },
}

export default function PublicJobDetailsPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const jobSlug = params.jobSlug as string
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      try {
        // Simular carregamento de dados
        await new Promise((resolve) => setTimeout(resolve, 800))
        // Em uma implementação real, você faria uma chamada de API aqui
        if (jobSlug === mockJobData.slug) {
          setJob(mockJobData)
        }
      } catch (error) {
        console.error("Erro ao carregar vaga:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobSlug])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vaga não encontrada</h2>
        <p className="text-gray-600 mb-6">A vaga que você está procurando não existe ou foi removida.</p>
        <Button asChild>
          <Link href={`/public/${tenantSlug}/jobs`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às vagas
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/public/${tenantSlug}/jobs`} className="hover:text-blue-600">
          Vagas
        </Link>
        <span>/</span>
        <span className="text-gray-900">{job.title}</span>
      </div>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span>Empresa</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Remoto/Híbrido</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>CLT</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {job.isPCDExclusive && <Badge className="bg-blue-100 text-blue-800">Exclusiva PCD</Badge>}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{job.candidatesCount} candidatos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/public/${tenantSlug}/jobs/${job.slug}/apply`}>Candidatar-se</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Vaga</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competencies */}
          <Card>
            <CardHeader>
              <CardTitle>Competências Necessárias</CardTitle>
              <CardDescription>Competências marcadas com * são obrigatórias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Obrigatórias</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.competencies
                      .filter((comp) => comp.isMandatory)
                      .map((comp) => (
                        <Badge key={comp.id} className="bg-red-100 text-red-800 hover:bg-red-200">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {comp.name}
                          <span className="ml-1 text-xs">
                            {Array.from({ length: comp.weight }, (_, i) => (
                              <Star key={i} className="inline h-2 w-2 fill-current" />
                            ))}
                          </span>
                        </Badge>
                      ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Desejáveis</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.competencies
                      .filter((comp) => !comp.isMandatory)
                      .map((comp) => (
                        <Badge
                          key={comp.id}
                          variant="secondary"
                          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          {comp.name}
                          <span className="ml-1 text-xs">
                            {Array.from({ length: comp.weight }, (_, i) => (
                              <Star key={i} className="inline h-2 w-2 fill-current" />
                            ))}
                          </span>
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Preview */}
          {job.questions && job.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Perguntas do Processo</CardTitle>
                <CardDescription>Estas perguntas serão feitas durante o processo de candidatura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.questions.map((question, index) => (
                    <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                      <p className="font-medium text-gray-900">
                        {index + 1}. {question.text}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {question.type === "open"
                          ? "Resposta aberta"
                          : `Múltipla escolha (${question.options?.length} opções)`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Candidatar-se</CardTitle>
              <CardDescription>Processo rápido e simples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Upload do currículo (PDF)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>Responder {job.questions?.length || 0} perguntas</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>Enviar candidatura</span>
                </div>
              </div>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <Link href={`/public/${tenantSlug}/jobs/${job.slug}/apply`}>Iniciar Candidatura</Link>
              </Button>
              <p className="text-xs text-gray-500 text-center">Processo estimado: 5-10 minutos</p>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">ST</span>
                </div>
                <div>
                  <h4 className="font-semibold">SMARTED TECH</h4>
                  <p className="text-sm text-gray-500">Tecnologia e Inovação</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Empresa líder em soluções tecnológicas, focada em inovação e desenvolvimento de produtos digitais.
              </p>
            </CardContent>
          </Card>

          {/* Other Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Outras Vagas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Link
                  href={`/public/${tenantSlug}/jobs/analista-dados-junior`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-sm">Analista de Dados Júnior</h4>
                  <p className="text-xs text-gray-500">12 candidatos</p>
                </Link>
                <Link
                  href={`/public/${tenantSlug}/jobs/designer-ux-ui`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-sm">Designer UX/UI</h4>
                  <p className="text-xs text-gray-500">8 candidatos</p>
                </Link>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/public/${tenantSlug}/jobs`}>Ver todas as vagas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
