export type JobStatus = "draft" | "aberta" | "pausada" | "fechada" | "cancelada";

export interface Competency {
  id: string;
  name: string;
  weight: 1 | 2 | 3 | 4 | 5;
}

export interface JobCreateFormProps {
  tenantSlug: string;
}

export interface JobQuestion {
  id: string;
  question: string;
  type: "text" | "multiple_choice" | "single_choice" | "file_upload";
  options?: string[];
  required: boolean;
  order: number;
}

export interface CandidateApplicationStep {
  step: number;
  name: string;
  status: "pending" | "completed" | "skipped";
}

export interface CandidateAnswer {
  questionId: string;
  answer: string | string[];
}

export interface Candidate {
  _id: string;
  jobId: string;
  jobSlug: string;
  name: string;
  email?: string;
  phone?: string;
  curriculumUrl: string;
  fileName: string;
  fileData?: string;
  applicationSteps?: CandidateApplicationStep[];
  answers?: CandidateAnswer[];
  isReferral: boolean;
  referredBy?: string;
  pcdStatus?: "declared" | "not_declared" | "pending_documentation";
  uploadedDocuments?: { name: string; url: string; type: "test" | "response" | "other" }[];
  annotations?: { text: string; createdAt: Date; createdBy: string }[];
  matchLevel?: "baixo" | "médio" | "alto";
  analysis?: {
    experienceScore: number;
    skillsScore: number;
    certificationsScore: number;
    behavioralScore: number;
    leadershipScore: number;
    finalScore: number;
    competencyScores?: { competencyId: string; score: number }[];
    comments: {
      experience: string;
      skills: string;
      certifications: string;
      behavioral?: string;
      leadership?: string;
    };
    extractedData?: {
      skills: string[];
      experience: string[];
      certifications: string[];
    };
  };
  currentStage: JobStatus;
  contactHistory?: { type: "email" | "call" | "wpp" | "meeting"; timestamp: Date; notes: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CriteriaWeights {
  experience: number;
  skills: number;
  certifications: number;
  behavioral: number;
  leadership: number;
}

export interface StatusChangeLog {
  status: JobStatus;
  changedAt: Date;
  changedBy: string;
  changedByName?: string;
}

export interface Job {
  _id: string;
  slug: string;
  title: string;
  description: string;
  competencies: Competency[];
  questions: JobQuestion[];
  isPCDExclusive: boolean;
  isReferralJob: boolean;
  criteriaWeights: CriteriaWeights;
  status: JobStatus;
  candidatesCount: number;
  isDraft: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  lastStatusUpdateBy?: string;
  lastStatusUpdateByName?: string;
  statusChangeLog?: StatusChangeLog[];
  department?: string;
  location?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType?: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel?: "junior" | "mid" | "senior" | "lead";
  tags?: string[];
  publishedAt?: Date;
  closingDate?: Date;
}