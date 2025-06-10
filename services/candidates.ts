import type { Candidate } from "@/types"

export const candidatesService = {
  uploadCurriculums: async (jobSlug: string, files: File[]): Promise<string[]> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Uploading curriculums for job:", jobSlug, files)

    return files.map((file) => Math.random().toString(36).substr(2, 9))
  },

  getCandidates: async (jobSlug: string): Promise<Candidate[]> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 800))

    return [
      {
        _id: "1",
        jobId: "1",
        jobSlug,
        name: "Ana Silva",
        email: "ana.silva@email.com",
        curriculumUrl: "/curriculos/ana-silva.pdf",
        fileName: "curriculo-ana-silva.pdf",
        analysis: {
          experienceScore: 85,
          skillsScore: 92,
          certificationsScore: 78,
          behavioralScore: 88,
          leadershipScore: 75,
          finalScore: 85.6,
          comments: {
            experience: "5+ anos em React e TypeScript",
            skills: "Domínio avançado em React, TypeScript, Node.js",
            certifications: "Certificações AWS e Google Cloud",
          },
        },
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
    ]
  },

  analyzeCandidates: async (jobSlug: string): Promise<void> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 5000))

    console.log("Analyzing candidates for job:", jobSlug)
  },

  downloadCurriculum: async (candidateId: string): Promise<Blob> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Downloading curriculum for candidate:", candidateId)

    // Return mock PDF blob
    return new Blob(["Mock PDF content"], { type: "application/pdf" })
  },
}
