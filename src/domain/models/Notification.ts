import { IBaseEntity } from "./base/BaseEntity";

export interface INotification extends IBaseEntity {
  recipientId: string; // User ID who receives the notification
  senderId?: string; // User ID who sent the notification (optional, e.g., system)
  senderName?: string; // Name of the sender (optional)
  type: string; // e.g., "job_application", "job_update", "system_alert"
  message: string; // The notification message
  resourceType?: string; // e.g., "job", "candidate", "user"
  resourceId?: string; // ID of the related resource
  isRead: boolean; // true if read, false if unread
  readAt?: Date; // Timestamp when read
  tenantId: string; // Tenant ID for multi-tenancy
}
