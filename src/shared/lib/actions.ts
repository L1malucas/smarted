import { saveAuditLogAction } from "@/infrastructure/actions/audit-actions";
import { IActionFunction, IActionLogConfig, IActionResult } from "../types/types/action-interface";
import { getSessionUser } from "@/infrastructure/actions/auth-actions"; // Import getSessionUser

export function withActionLogging<TArgs extends any[], TResult>(
  action: IActionFunction<TArgs, TResult>,
  actionType: IActionLogConfig['actionType'],
  resourceType: IActionLogConfig['resourceType'],
  resourceId?: IActionLogConfig['resourceId'],
  details?: IActionLogConfig['details']
): IActionFunction<TArgs, IActionResult<TResult>> {
  return async (...args: TArgs): Promise<IActionResult<TResult>> => {
    const session = await getSessionUser(); // Get session her.

    let logConfig: IActionLogConfig = {
      userId: session?.userId ?? "anonymous",
      userName: session?.name ?? "Sistema",
      actionType: actionType,
      resourceType: resourceType,
      resourceId: resourceId,
      details: details,
      success: false, // Will be updated based on outcome
      tenantId: session?.tenantId ?? "",
      tenantName: session?.tenantName ?? "",
    };

    try {
      const result = await action(...args);

      logConfig.success = true;
      await saveAuditLogAction(logConfig);

      return { success: true, data: result };
    } catch (error: any) {
      if (error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
        throw error;
      }

      let errorMessage = "Ocorreu um erro desconhecido.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      logConfig.success = false;
      logConfig.details = logConfig.details || `Ação ${logConfig.actionType} em ${logConfig.resourceType} falhou: ${errorMessage}`;
      await saveAuditLogAction(logConfig);

      return { success: false, error: errorMessage };
    }
  };
}