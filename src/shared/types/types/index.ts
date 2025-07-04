export interface SystemNotification {
  _id: string
  userId: string
  message: string
  type: "info" | "warning" | "error" | "success"
  relatedResource?: { type: "job" | "candidate"; id: string; title?: string }
  isRead: boolean
  createdAt: Date
  link?: string
}

export interface SharedResourceInfo {
  resourceType: "job" | "candidates" | "report"
  resourceId: string
  tenantSlug?: string // To reconstruct links if needed
  expiresAt?: number // Timestamp for frontend expiry
  passwordHash?: string // For password protected jobs
}
