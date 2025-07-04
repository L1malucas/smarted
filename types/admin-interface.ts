export interface AllowedCPF {
  cpf: string
  name: string
  isAdmin: boolean
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  details?: string;
  success: boolean;
  timestamp: Date;
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalJobs: number
  totalCandidates: number
  systemUptime: string
  avgResponseTime: string
}