import { saveAuditLogAction } from "@/infrastructure/actions/audit-actions";
import { ActionFunction, ActionLogConfig } from "../types/types/action-interface";

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

      throw error;
    }
  };
}