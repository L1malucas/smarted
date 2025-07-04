'use server';

import { withActionLogging } from '@/lib/actions';
import { ActionLogConfig } from '@/types/action-interface';

async function loginActionInternal(cpf: string) {
  // No direct signIn call here. This server action will only validate and prepare data.
  // The actual signIn will happen on the client-side using the useAuth hook.
  return { success: true, data: { cpf: cpf } };
}

// Exported functions that wrap the internal actions with logging
export const loginAction = async (cpf: string) => {
  const logConfig: ActionLogConfig = {
    userId: cpf,
    userName: "",
    actionType: "Login",
    resourceType: "User",
    resourceId: "",
    successMessage: "Login bem-sucedido!",
    errorMessage: "Falha no login. Verifique seu CPF.",
    success: false
  };
  const result = await loginActionInternal(cpf);
  return result;
};
