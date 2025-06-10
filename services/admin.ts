interface AllowedCPF {
  cpf: string
  name: string
  isAdmin: boolean
  createdAt: Date
}

interface AccessLog {
  id: string
  cpf: string
  name: string
  action: string
  timestamp: Date
  success: boolean
}

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalJobs: number
  totalCandidates: number
  systemUptime: string
  avgResponseTime: string
}

export const adminService = {
  getAllowedCPFs: async (): Promise<AllowedCPF[]> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [
      {
        cpf: "123.456.789-00",
        name: "João Silva",
        isAdmin: true,
        createdAt: new Date("2024-01-15"),
      },
      {
        cpf: "987.654.321-00",
        name: "Maria Santos",
        isAdmin: false,
        createdAt: new Date("2024-01-10"),
      },
    ]
  },

  addAllowedCPF: async (cpf: string, name: string, isAdmin: boolean): Promise<void> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Adding allowed CPF:", { cpf, name, isAdmin })
  },

  removeAllowedCPF: async (cpf: string): Promise<void> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 800))

    console.log("Removing allowed CPF:", cpf)
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 600))

    return [
      {
        id: "1",
        cpf: "123.456.789-00",
        name: "João Silva",
        action: "Login",
        timestamp: new Date(),
        success: true,
      },
      {
        id: "2",
        cpf: "987.654.321-00",
        name: "Maria Santos",
        action: "Upload",
        timestamp: new Date(),
        success: true,
      },
    ]
  },

  getSystemMetrics: async (): Promise<SystemMetrics> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 400))

    return {
      totalUsers: 15,
      activeUsers: 8,
      totalJobs: 23,
      totalCandidates: 456,
      systemUptime: "99.9%",
      avgResponseTime: "245ms",
    }
  },
}
