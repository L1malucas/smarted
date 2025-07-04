import { toast } from "sonner";
import { ActionFunction, ActionLogConfig } from "@/types/action-interface";
import { saveAuditLogAction } from "@/actions/audit-actions"; // Import the new Server Action

export function withActionLogging<TArgs extends any[], TResult>(
  action: ActionFunction<TArgs, TResult>,
  logConfig: ActionLogConfig
): ActionFunction<TArgs, TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const result = await action(...args);

      await saveAuditLogAction({
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
      await saveAuditLogAction({
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