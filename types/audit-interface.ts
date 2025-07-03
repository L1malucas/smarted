import { JobStatus } from "./jobs-interface";

export interface AuditLog {
  _id?: string; // Optional for creation
  timestamp?: Date; // Optional for creation, Mongoose handles default
  userId: string;
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  success: boolean;
}

export interface StatusChangeLog {
  status: JobStatus;
  changedAt: Date;
  changedBy: string;
  changedByName: string;
  reason?: string;
}
