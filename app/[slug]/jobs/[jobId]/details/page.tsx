"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import type { Job, Candidate } from "@/types"
import { JobDetails } from "@/components/job-details"

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

export default function JobDetailsPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    const fetchData = async () => {
      setLoading(true)
      try {
        // Em uma implementação real, você faria chamadas de API aqui
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular delay de rede
        setJob(mockJob)
        setCandidates(mockCandidates)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId])

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

  return <JobDetails job={job} candidates={candidates} tenantSlug={tenantSlug} radarData={radarData} />
}
