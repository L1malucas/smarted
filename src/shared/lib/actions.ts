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

      toast({
        title: "Sucesso",
        description: `Ação ${logConfig.actionType} realizada com sucesso.`, // Use a more generic success message
        variant: "default",
      });

      return { success: true, data: result };
    } catch (error: any) {
      const errorMessage = error.message || "Ocorreu um erro desconhecido.";

      await saveAuditLogAction({
        userId: logConfig.userId,
        userName: logConfig.userName,
        actionType: logConfig.actionType,
        resourceType: logConfig.resourceType,
        resourceId: logConfig.resourceId,
        details: logConfig.details || `Ação ${logConfig.actionType} em ${logConfig.resourceType} falhou: ${errorMessage}`,
        success: false,
      });

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  };
}