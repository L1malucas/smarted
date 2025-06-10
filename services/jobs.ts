import type { Job } from "@/types"

export const jobsService = {
  createJob: async (job: Partial<Job>): Promise<Job> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newJob: Job = {
      _id: Math.random().toString(36).substr(2, 9),
      slug: job.title?.toLowerCase().replace(/\s+/g, "-") || "nova-vaga",
      title: job.title || "",
      description: job.description || "",
      criteriaWeights: job.criteriaWeights || {
        experience: 25,
        skills: 25,
        certifications: 20,
        behavioral: 15,
        leadership: 15,
      },
      createdBy: "joao-silva-abc123",
      status: job.status || "draft",
      candidatesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Job created:", newJob)
    return newJob
  },

  getJobs: async (): Promise<Job[]> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [
      {
        _id: "1",
        slug: "desenvolvedor-frontend-senior",
        title: "Desenvolvedor Frontend Sênior",
        description: "Buscamos um desenvolvedor frontend experiente...",
        criteriaWeights: {
          experience: 30,
          skills: 30,
          certifications: 15,
          behavioral: 15,
          leadership: 10,
        },
        createdBy: "joao-silva-abc123",
        status: "active",
        candidatesCount: 23,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
    ]
  },

  getJobBySlug: async (slug: string): Promise<Job | null> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (slug === "desenvolvedor-frontend-senior") {
      return {
        _id: "1",
        slug,
        title: "Desenvolvedor Frontend Sênior",
        description: "Buscamos um desenvolvedor frontend experiente...",
        criteriaWeights: {
          experience: 30,
          skills: 30,
          certifications: 15,
          behavioral: 15,
          leadership: 10,
        },
        createdBy: "joao-silva-abc123",
        status: "active",
        candidatesCount: 23,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      }
    }

    return null
  },

  updateJob: async (slug: string, job: Partial<Job>): Promise<Job> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 800))

    console.log("Updating job:", slug, job)

    return {
      _id: "1",
      slug,
      title: job.title || "Updated Job",
      description: job.description || "",
      criteriaWeights: job.criteriaWeights || {
        experience: 25,
        skills: 25,
        certifications: 20,
        behavioral: 15,
        leadership: 15,
      },
      createdBy: "joao-silva-abc123",
      status: job.status || "active",
      candidatesCount: 23,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date(),
    }
  },
}
