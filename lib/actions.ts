import { AuditService } from "@/services/audit";
import { toast } from "sonner";
import { AuditLog } from "@/types/audit-interface";

const auditService = new AuditService();

type ActionFunction<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

interface ActionLogConfig {
  userId: string;
  userName: string;
  actionType: AuditLog["actionType"];
  resourceType: AuditLog["resourceType"];
  resourceId?: string;
  details?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function withActionLogging<TArgs extends any[], TResult>(
  action: ActionFunction<TArgs, TResult>,
  logConfig: ActionLogConfig
): ActionFunction<TArgs, TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const result = await action(...args);

      await auditService.saveAuditLog({
        userId: logConfig.userId,
        userName: logConfig.userName,
        actionType: logConfig.actionType,
        resourceType: logConfig.resourceType,
        resourceId: logConfig.resourceId,
        details: logConfig.details || `Action ${logConfig.actionType} on ${logConfig.resourceType} successful.`, 
        success: true,
      });

      if (logConfig.successMessage) {
        toast.success(logConfig.successMessage);
      }

      return result;
    } catch (error: any) {
      await auditService.saveAuditLog({
        userId: logConfig.userId,
        userName: logConfig.userName,
        actionType: logConfig.actionType,
        resourceType: logConfig.resourceType,
        resourceId: logConfig.resourceId,
        details: logConfig.details || `Action ${logConfig.actionType} on ${logConfig.resourceType} failed: ${error.message || "Unknown error"}`, 
        success: false,
      });

      toast.error(logConfig.errorMessage || "Ocorreu um erro inesperado.", {
        description: error.message || "Por favor, tente novamente.",
      });

      throw error; // Re-throw the error so the caller can handle it if needed
    }
  };
}
