import { AuditLog } from "./audit-interface";

export type ActionFunction<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

export interface ActionLogConfig {
  userId: string;
  userName: string;
  actionType: AuditLog["actionType"];
  resourceType: AuditLog["resourceType"];
  resourceId?: string;
  details?: string;
  success: boolean;
}
