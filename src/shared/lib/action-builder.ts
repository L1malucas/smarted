import { getSessionUser } from "@/infrastructure/actions/auth-actions";
import { saveAuditLog } from "@/infrastructure/logging/audit";
import { IActionLogConfig, IActionResult } from "../types/types/action-interface";
import { IUserPayload } from "../types/types/auth";

// Tipos para o Action Builder
type ActionLogic<TArgs extends any[], TResult> = (
  params: {
    session: IUserPayload;
    args: TArgs;
  }
) => Promise<TResult>;

interface ICreateLoggedActionParams<TArgs extends any[], TResult> {
  actionName: string;
  resourceType: string;
  requireAuth?: boolean;
  action: ActionLogic<TArgs, TResult>;
  getResourceId?: (result: TResult, args: TArgs) => string | undefined;
  getDetails?: (result: TResult, error?: Error) => string | undefined;
}

/**
 * Cria uma Server Action com logging de auditoria integrado e tratamento de erros.
 *
 * @param params - Parâmetros de configuração da ação.
 * @returns Uma função de Server Action assíncrona.
 */
export function createLoggedAction<TArgs extends any[], TResult>(
  params: ICreateLoggedActionParams<TArgs, TResult>
) {
  const { 
    actionName,
    resourceType,
    requireAuth = true, // Padrão para exigir autenticação
    action,
    getResourceId,
    getDetails
  } = params;

  return async (...args: TArgs): Promise<IActionResult<TResult>> => {
    let session: IUserPayload | null = null;

    try {
      session = await getSessionUser();

      if (requireAuth && !session) {
        throw new Error("Acesso não autorizado. A sessão do usuário não foi encontrada.");
      }

      // A sessão é passada para a lógica da ação, evitando chamadas duplas
      const result = await action({ session: session!, args });

      // Log de sucesso
      const logConfig: IActionLogConfig = {
        userId: session?.userId ?? "system",
        userName: session?.name ?? "Sistema",
        tenantId: session?.tenantId ?? "",
        tenantName: session?.tenantName ?? "",
        actionType: actionName,
        resourceType: resourceType,
        resourceId: getResourceId ? getResourceId(result, args) : undefined,
        details: getDetails ? getDetails(result) : undefined,
        success: true,
      };
      await saveAuditLog(logConfig);

      return { success: true, data: result };

    } catch (error: any) {
      // Ignora erros de redirecionamento do Next.js
      if (error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      
      // Log de falha
      const logConfig: IActionLogConfig = {
        userId: session?.userId ?? "system",
        userName: session?.name ?? "Sistema",
        tenantId: session?.tenantId ?? "",
        tenantName: session?.tenantName ?? "",
        actionType: actionName,
        resourceType: resourceType,
        resourceId: getResourceId ? getResourceId(null as any, args) : undefined,
        // Tenta obter detalhes do erro, se a função for fornecida
        details: getDetails ? getDetails(null as any, error) : `Falha na ação: ${errorMessage}`,
        success: false,
      };
      await saveAuditLog(logConfig);

      return { success: false, error: errorMessage };
    }
  };
}