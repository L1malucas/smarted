export interface AllowedCPF {
  cpf: string
  name: string
  isAdmin: boolean
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface AccessLog {
  id: string
  cpf: string
  name: string
  action: string
  timestamp: Date
  success: boolean
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalJobs: number
  totalCandidates: number
  systemUptime: string
  avgResponseTime: string
}