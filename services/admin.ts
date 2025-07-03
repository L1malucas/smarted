// services/admin.ts
import { AccessLog, AllowedCPF, SystemMetrics } from "@/types/admin-interface"

export const adminService = {
  createuser: async (cpf: string, name: string, isAdmin: boolean, email: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  },

  getAllowedCPFs: async (): Promise<AllowedCPF[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return JSON.parse(localStorage.getItem('allowed_cpfs') || '[]', (key, value) => {
      if (key === "createdAt" || key === "updatedAt") return new Date(value)
      return value
    })
  },

  addAllowedCPF: async (cpf: string, name: string, isAdmin: boolean, email: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const currentCPFs: AllowedCPF[] = await adminService.getAllowedCPFs()
    const newCPF: AllowedCPF = {
      cpf,
      name,
      isAdmin,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const updatedCPFs = [...currentCPFs, newCPF]
    localStorage.setItem('allowed_cpfs', JSON.stringify(updatedCPFs))
  },

  removeAllowedCPF: async (cpf: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const currentCPFs: AllowedCPF[] = await adminService.getAllowedCPFs()
    const updatedCPFs = currentCPFs.filter((user) => user.cpf !== cpf)
    localStorage.setItem('allowed_cpfs', JSON.stringify(updatedCPFs))
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return JSON.parse(localStorage.getItem('access_logs') || '[]', (key, value) => {
      if (key === "timestamp") return new Date(value)
      return value
    })
  },

  addAccessLog: async (log: AccessLog): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const currentLogs: AccessLog[] = await adminService.getAccessLogs()
    const updatedLogs = [...currentLogs, log]
    localStorage.setItem('access_logs', JSON.stringify(updatedLogs))
  },

  getSystemMetrics: async (): Promise<SystemMetrics> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const cpfs = await adminService.getAllowedCPFs()
    return {
      totalUsers: cpfs.length,
      activeUsers: Math.floor(cpfs.length * 0.6),
      totalJobs: 23,
      totalCandidates: 456,
      systemUptime: "99.9%",
      avgResponseTime: "245ms",
    }
  },
}