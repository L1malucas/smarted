import { Candidate } from "@/types/jobs-interface"


export const candidatesService = {
  uploadCurriculums: async (jobSlug: string, files: File[]): Promise<string[]> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return files.map((file) => Math.random().toString(36).substr(2, 9))
  },

  getCandidatesForScreening: async (tenantSlug: string, jobId?: string | null): Promise<Candidate[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const allCandidates: Candidate[] = [
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
      {
        _id: "cand3",
        jobId: "2",
        jobSlug: "ux-designer",
        name: "Charlie Design",
        email: "charlie@example.com",
        curriculumUrl: "#",
        fileName: "charlie_cv.pdf",
        isReferral: false,
        currentStage: "triagem",
        createdAt: new Date(),
        updatedAt: new Date(),
        analysis: {
          finalScore: 90,
          experienceScore: 0,
          skillsScore: 0,
          certificationsScore: 0,
          behavioralScore: 0,
          leadershipScore: 0,
          comments: { experience: "", skills: "", certifications: "" },
        },
        matchLevel: "alto",
      },
    ]

    let filteredCandidates = allCandidates.filter(c => c.currentStage === "triagem")

    if (jobId && jobId !== "all") {
      filteredCandidates = filteredCandidates.filter(c => c.jobId === jobId)
    }

    // Simulate tenant filtering if needed, though mock data doesn't have tenant info
    // if (tenantSlug) { /* filter by tenantSlug */ }

    return filteredCandidates
  },

  analyzeCandidates: async (jobSlug: string): Promise<void> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 5000))

  },

  downloadCurriculum: async (candidateId: string): Promise<Blob> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock PDF blob
    return new Blob(["Mock PDF content"], { type: "application/pdf" })
  },
}
