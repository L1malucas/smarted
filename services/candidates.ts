import type { Candidate } from "@/types"

export const candidatesService = {
  uploadCurriculums: async (jobSlug: string, files: File[]): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return files.map((file) => Math.random().toString(36).substr(2, 9))
  },

  getCandidatesForScreening: async (tenantSlug: string, jobId?: string | null): Promise<Candidate[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return []; // No candidates by default
  },

  analyzeCandidates: async (jobSlug: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 5000))
  },

  downloadCurriculum: async (candidateId: string): Promise<Blob> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return new Blob(["Mock PDF content"], { type: "application/pdf" })
  },
}
