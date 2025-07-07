/**
 * @interface IAuditLog
 * @description Consolidated interface for logging user actions and system events.
 */
export interface IAuditLog {
  _id?: string;
  userId: string;
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  success: boolean;
  timestamp: Date;
}
