// Mock data - replace with actual API calls
import type { AuditLog, Candidate, Job, JobStatus, User } from "@/types" // Assuming types are defined

export const mockCandidatesscrening: Candidate[] = [
  // Add mock candidate data here, including `currentStage: 'triagem'`
  {
    _id: "cand1",
    jobId: "1",
    jobSlug: "dev-frontend",
    name: "Alice Wonderland",
    email: "alice@example.com",
    curriculumUrl: "#",
    fileName: "alice_cv.pdf",
    isReferral: false,
    currentStage: "triagem",
    createdAt: new Date(),
    updatedAt: new Date(),
    analysis: {
      finalScore: 85,
      experienceScore: 0,
      skillsScore: 0,
      certificationsScore: 0,
      behavioralScore: 0,
      leadershipScore: 0,
      comments: { experience: "", skills: "", certifications: "" },
    },
    matchLevel: "alto",
  },
  {
    _id: "cand2",
    jobId: "1",
    jobSlug: "dev-frontend",
    name: "Bob The Builder",
    email: "bob@example.com",
    curriculumUrl: "#",
    fileName: "bob_cv.pdf",
    isReferral: true,
    currentStage: "triagem",
    createdAt: new Date(),
    updatedAt: new Date(),
    analysis: {
      finalScore: 75,
      experienceScore: 0,
      skillsScore: 0,
      certificationsScore: 0,
      behavioralScore: 0,
      leadershipScore: 0,
      comments: { experience: "", skills: "", certifications: "" },
    },
    matchLevel: "médio",
  },
]

export const mockJobsscrening: Job[] = [
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
]

export const jobStatusOptions: { value: JobStatus; label: string }[] = [
  { value: "aberta", label: "Aberta" },
  { value: "recrutamento", label: "Recrutamento" },
  { value: "triagem", label: "Triagem" },
  { value: "avaliação", label: "Avaliação" },
  { value: "contato", label: "Contato" },
  { value: "vaga fechada", label: "Vaga Fechada" },
  { value: "draft", label: "Rascunho" },
]

export const mockAllowedCPFs: User[] = [
  {
    _id: "user1",
    cpf: "123.456.789-00",
    slug: "joao-silva",
    name: "João Silva",
    isAdmin: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
    roles: ["admin"],
    email: "joao@email.com",
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
    email: "joao@email.com",
    roles: ["recruiter"],
    permissions: [],
  },
]

export const mockJobsForAdmin: Job[] = [
  {
    _id: "job1",
    title: "Vaga Expirada Exemplo",
    description: "Descrição da vaga expirada",
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
    description: "Descrição da vaga inativa",
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

export const mockAuditLogs: AuditLog[] = [
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
