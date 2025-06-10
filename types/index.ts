export interface User {
  _id: string
  cpf: string
  slug: string // Hash do CPF para URLs seguras
  name: string
  email: string
  roles: string[]
  permissions: string[]
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export type JobStatus = "aberta" | "recrutamento" | "triagem" | "avaliação" | "contato" | "vaga fechada" | "draft"

export interface Competency {
  id: string
  name: string
  weight: 1 | 2 | 3 | 4 | 5
  isMandatory?: boolean
}

export interface JobQuestion {
  id: string
  text: string
  type: "open" | "closed"
  options?: string[]
}

export interface Job {
  _id: string
  slug: string
  title: string
  description: string
  competencies: Competency[]
  questions: JobQuestion[]
  isPCDExclusive: boolean
  isReferralJob: boolean // Se true, candidato pula perguntas
  criteriaWeights: {
    experience: number
    skills: number
    certifications: number
    behavioral: number
    leadership: number
  }
  createdBy: string
  createdByName?: string
  lastStatusUpdateBy?: string
  lastStatusUpdateByName?: string
  statusChangeLog?: { status: JobStatus; changedAt: Date; changedBy: string; changedByName?: string }[]
  status: JobStatus
  candidatesCount: number
  pendingActionsCount?: number // For dashboard metric
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  // For shared jobs with password
  sharedPasswordHash?: string // Store hash of password, not plaintext
}

export interface CandidateApplicationStep {
  step: number
  name: string
  status: "pending" | "completed" | "skipped"
}

export interface CandidateAnswer {
  questionId: string
  answer: string | string[] // string for open, string[] for closed (multiple selections possible)
}

export interface Candidate {
  _id: string
  jobId: string
  jobSlug: string
  name: string
  email?: string
  phone?: string
  curriculumUrl: string
  fileName: string
  fileData?: string
  applicationSteps?: CandidateApplicationStep[]
  answers?: CandidateAnswer[]
  isReferral: boolean
  referredBy?: string
  pcdStatus?: "declared" | "not_declared" | "pending_documentation"
  uploadedDocuments?: { name: string; url: string; type: "test" | "response" | "other" }[]
  annotations?: { text: string; createdAt: Date; createdBy: string }[]
  matchLevel?: "baixo" | "médio" | "alto"
  analysis?: {
    experienceScore: number
    skillsScore: number
    certificationsScore: number
    behavioralScore: number
    leadershipScore: number
    finalScore: number
    competencyScores?: { competencyId: string; score: number }[]
    comments: {
      experience: string
      skills: string
      certifications: string
      behavioral?: string
      leadership?: string
    }
    extractedData?: {
      skills: string[]
      experience: string[]
      certifications: string[]
    }
  }
  currentStage: JobStatus
  contactHistory?: { type: "email" | "call" | "wpp" | "meeting"; timestamp: Date; notes: string }[]
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  _id: string
  timestamp: Date
  userId: string
  userName: string
  actionType:
    | "create"
    | "update"
    | "delete"
    | "login"
    | "logout"
    | "export"
    | "share"
    | "status_change"
    | "access_shared"
  resourceType: "job" | "candidate" | "user" | "system" | "report"
  resourceId?: string
  details: string
  previousState?: any
  newState?: any
}

export interface SystemNotification {
  _id: string
  userId: string
  message: string
  type: "info" | "warning" | "error" | "success"
  relatedResource?: { type: "job" | "candidate"; id: string; title?: string }
  isRead: boolean
  createdAt: Date
  link?: string
}

// For shared link data (could be stored in DB or encoded in hash if simple)
export interface SharedResourceInfo {
  resourceType: "job" | "candidates" | "report"
  resourceId: string
  tenantSlug?: string // To reconstruct links if needed
  expiresAt?: number // Timestamp for frontend expiry
  passwordHash?: string // For password protected jobs
}
