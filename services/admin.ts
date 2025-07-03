// services/admin.ts
import { AccessLog, AllowedCPF, SystemMetrics } from "@/types/admin-interface"

export const adminService = {
  createuser: async (cpf: string, name: string, isAdmin: boolean, email: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Simulate user creation
  },

  getAllowedCPFs: async (): Promise<AllowedCPF[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return []; // No allowed CPFs by default
  },

  addAllowedCPF: async (cpf: string, name: string, isAdmin: boolean, email: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Simulate adding CPF
  },

  removeAllowedCPF: async (cpf: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    // Simulate removing CPF
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return []; // No access logs by default
  },

  addAccessLog: async (log: AccessLog): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    // Simulate adding access log
  },

  getSystemMetrics: async (): Promise<SystemMetrics> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalJobs: 0,
      totalCandidates: 0,
      systemUptime: "0%",
      avgResponseTime: "0ms",
    }
  },
}