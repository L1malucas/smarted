import { JobStatus } from "./jobs-interface";

export interface AuditLog {
  _id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  actionType: "create" | "update" | "delete" | "login" | "logout" | "export" | "share" | "status_change" | "access_shared";
  resourceType: "job" | "candidate" | "user" | "system" | "report";
  resourceId?: string;
  details: string;
  previousState?: any;
  newState?: any;
}

export interface StatusChangeLog {
  status: JobStatus;
  changedAt: Date;
  changedBy: string;
  changedByName: string;
  reason?: string;
}