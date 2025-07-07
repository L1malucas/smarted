import { IAuditLog } from '@/domain/models/AuditLog';

export type IActionFunction<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

export interface IActionLogConfig {
  userId: string;
  userName: string;
  actionType: IAuditLog["actionType"];
  resourceType: IAuditLog["resourceType"];
  resourceId?: string;
  details?: string;
  success: boolean;
  tenantId: string;
  tenantName?: string;
}

export interface IActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
