import { saveAuditLogAction } from "@/infrastructure/actions/audit-actions";
import { toast } from "@/shared/hooks/use-toast";
import { IActionFunction, IActionLogConfig, IActionResult } from "../types/types/action-interface";

export function withActionLogging<TArgs extends any[], TResult>(
  action: IActionFunction<TArgs, TResult>,
  logConfig: IActionLogConfig
): IActionFunction<TArgs, IActionResult<TResult>> {
  return async (...args: TArgs): Promise<IActionResult<TResult>> => {
    try {
      const result = await action(...args);

      await saveAuditLogAction({
        userId: logConfig.userId,
        userName: logConfig.userName,
        actionType: logConfig.actionType,
        resourceType: logConfig.resourceType,
        resourceId: logConfig.resourceId,
        details: logConfig.details || `Ação ${logConfig.actionType} em ${logConfig.resourceType} bem-sucedida.`,
        success: true,
      });



      return { success: true, data: result };
    } catch (error: any) {
      if (error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
        throw error; // Re-throw the redirect error so Next.js can handle it
      }

      let errorMessage = "Ocorreu um erro desconhecido.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      await saveAuditLogAction({
        userId: logConfig.userId,
        userName: logConfig.userName,
        actionType: logConfig.actionType,
        resourceType: logConfig.resourceType,
        resourceId: logConfig.resourceId,
        details: logConfig.details || `Ação ${logConfig.actionType} em ${logConfig.resourceType} falhou: ${errorMessage}`,
        success: false,
      });

      return { success: false, error: errorMessage };
    }
  };
}