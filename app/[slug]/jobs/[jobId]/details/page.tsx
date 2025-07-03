"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import type { Job, Candidate } from "@/types/jobs-interface"
import { JobDetails } from "@/components/jobs/job-details"
import { JobService } from "@/services/jobs"
import { candidatesService } from "@/services/candidates"
import { toast } from "@/hooks/use-toast"

// Mock data para o gráfico radar
const radarData = [
  { subject: "Experiência", A: 78.3, fullMark: 100 },
  { subject: "Habilidades", A: 88.3, fullMark: 100 },
  { subject: "Certificações", A: 75.0, fullMark: 100 },
  { subject: "Comportamental", A: 84.0, fullMark: 100 },
  { subject: "Liderança", A: 77.7, fullMark: 100 },
]

// Mock candidatos
const mockCandidates = [
  {
    _id: "1",
    jobId: "1",
    jobSlug: "desenvolvedor-frontend-senior",
    name: "Ana Silva",
    email: "ana.silva@email.com",
    curriculumUrl: "/curriculos/ana-silva.pdf",
    fileName: "curriculo-ana-silva.pdf",
    isReferral: false,
    currentStage: "avaliação",
    createdAt: new Date(),
    updatedAt: new Date(),
    analysis: {
      experienceScore: 85,
      skillsScore: 92,
      certificationsScore: 78,
      behavioralScore: 88,
      leadershipScore: 75,
      finalScore: 85.6,
      comments: {
        experience: "5+ anos em React e TypeScript, experiência sólida em projetos complexos",
        skills: "Domínio avançado em React, TypeScript, Node.js e ferramentas modernas",
        certifications: "Certificações AWS e Google Cloud, cursos especializados em frontend",
      },
    },
    matchLevel: "alto",
  },
  {
    _id: "2",
    jobId: "1",
    jobSlug: "desenvolvedor-frontend-senior",
    name: "Carlos Santos",
    email: "carlos.santos@email.com",
    curriculumUrl: "/curriculos/carlos-santos.pdf",
    fileName: "curriculo-carlos-santos.pdf",
    isReferral: false,
    currentStage: "avaliação",
    createdAt: new Date(),
    updatedAt: new Date(),
    analysis: {
      experienceScore: 78,
      skillsScore: 85,
      certificationsScore: 82,
      behavioralScore: 79,
      leadershipScore: 88,
      finalScore: 82.4,
      comments: {
        experience: "4 anos de experiência, projetos variados em diferentes tecnologias",
        skills: "Bom conhecimento em React, Vue.js e Angular, versatilidade técnica",
        certifications: "Certificações Microsoft e Scrum Master, formação continuada",
      },
    },
    matchLevel: "médio",
  },
]

// Mock job
const mockJob: Job = {
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
  competencies: [
    { id: "comp1", name: "React", weight: 5, isMandatory: true },
    { id: "comp2", name: "TypeScript", weight: 4, isMandatory: true },
    { id: "comp3", name: "Next.js", weight: 3, isMandatory: false },
  ],
  questions: [
    { id: "q1", text: "Qual sua experiência com React?", type: "open" },
    { id: "q2", text: "Você tem experiência com TypeScript?", type: "closed", options: ["Sim", "Não", "Parcialmente"] },
  ],
  isPCDExclusive: false,
  isReferralJob: false,
  criteriaWeights: { experience: 30, skills: 30, certifications: 15, behavioral: 15, leadership: 10 },
}

/**
 * Componente de página para exibição detalhada de uma vaga de emprego.
 * 
 * @remarks
 * Este componente é renderizado na rota `/[slug]/jobs/[jobId]/details` e gerencia:
 * - O carregamento dos dados da vaga
 * - O estado de loading
 * - A exibição do skeleton durante o carregamento
 * - A renderização dos detalhes da vaga
 * 
 * @param params - Parâmetros da rota obtidos via useParams
 * @param params.slug - Slug do tenant (empresa/organização)
 * @param params.jobId - ID único da vaga
 * 
 * @returns Renderiza o componente {@link JobDetails} com os dados carregados ou estados de loading/erro
 * 
 * @dependencies
 * - Requer o componente {@link JobDetails} para renderização dos dados
 * - Utiliza mock data temporariamente (mockJob, mockCandidates, radarData)
 * - Depende do hook useParams para acessar parâmetros da rota
 * 
 * @state
 * - job: {@link Job} - Dados da vaga atual
 * - candidates: {@link Candidate[]} - Lista de candidatos para a vaga
 * - loading: boolean - Estado de carregamento
 * 
 * @workflow
 * 1. Componente é montado e inicia o carregamento
 * 2. Exibe skeleton durante loading
 * 3. Após carregamento, verifica existência dos dados
 * 4. Renderiza JobDetails com dados ou mensagem de erro
 * 
 * @todo
 * - Implementar chamadas reais à API removendo dados mock
 * - Adicionar tratamento de erros mais robusto
 * - Implementar paginação de candidatos se necessário
 * 
 * @example
 * Uso na navegação:
 * ```
 * /empresa-abc/jobs/123/details
 * ```
 */
export default function JobDetailsPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const fetchedJob = await JobService.getJobById(jobId)
        setJob(fetchedJob)

        // Fetch candidates for this job
        const fetchedCandidates = await candidatesService.getCandidatesForScreening(tenantSlug, jobId)
        setCandidates(fetchedCandidates)

      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os detalhes da vaga.",
          variant: "destructive",
        });
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId, tenantSlug])

  // Default radar data if no candidates or analysis
  const defaultRadarData = [
    { subject: "Experiência", A: 0, fullMark: 100 },
    { subject: "Habilidades", A: 0, fullMark: 100 },
    { subject: "Certificações", A: 0, fullMark: 100 },
    { subject: "Comportamental", A: 0, fullMark: 100 },
    { subject: "Liderança", A: 0, fullMark: 100 },
  ];

  // Calculate radar data based on candidates (if any)
  const currentRadarData = candidates.length > 0 ? [
    { subject: "Experiência", A: candidates.reduce((sum, c) => sum + (c.analysis?.experienceScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Habilidades", A: candidates.reduce((sum, c) => sum + (c.analysis?.skillsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Certificações", A: candidates.reduce((sum, c) => sum + (c.analysis?.certificationsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Comportamental", A: candidates.reduce((sum, c) => sum + (c.analysis?.behavioralScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Liderança", A: candidates.reduce((sum, c) => sum + (c.analysis?.leadershipScore || 0), 0) / candidates.length, fullMark: 100 },
  ] : defaultRadarData;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (!job) {
    return <div className="text-center py-12">Vaga não encontrada.</div>
  }

  return <JobDetails job={job} candidates={candidates} tenantSlug={tenantSlug} radarData={currentRadarData} />
}
