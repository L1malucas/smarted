'use server';

import { z } from 'zod';
import { loginSchema, LoginInput } from '@/lib/schemas/auth.schema';
import { signIn, signOut } from 'next-auth/react'; // Import NextAuth functions
import { withActionLogging } from '@/lib/actions';
import { ActionLogConfig } from '@/types/action-interface';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import authOptions
import { getServerSession } from "next-auth"; // Import getServerSession

async function loginActionInternal(payload: LoginInput) {
  const validatedData = loginSchema.parse(payload);
  const { cpf } = validatedData;

  const result = await signIn("credentials", {
    cpf,
    redirect: false, // Prevent NextAuth from redirecting
  });

  if (result?.error) {
    return { success: false, error: result.error };
  }

  // After successful sign-in, get the session to return user data
  const session = await getServerSession(authOptions);
  if (session && session.user) {
    return { success: true, data: { user: session.user } };
  } else {
    return { success: false, error: 'Erro ao obter dados da sessão após o login.' };
  }
}

async function logoutActionInternal(): Promise<{ success: boolean, error?: string }> {
  await signOut({ redirect: false }); // Prevent NextAuth from redirecting
  return { success: true };
}

// Exported functions that wrap the internal actions with logging
export const loginAction = async (payload: LoginInput) => {
  // For login, session is not available before the action, so we use a generic log config
  const logConfig: ActionLogConfig = {
    userId: payload.cpf, // Use CPF as userId for logging before actual session is established
    userName: "", // Will be populated after successful login
    actionType: "Login",
    resourceType: "User",
    resourceId: "",
    successMessage: "Login bem-sucedido!",
    errorMessage: "Falha no login. Verifique seu CPF.",
  };
  const result = await loginActionInternal(payload);
  return result;
};

export const logoutAction = async () => {
  const session = await getServerSession(authOptions); // Get session before logout
  const logConfig: ActionLogConfig = {
    userId: session?.user?.id || "unknown",
    userName: session?.user?.name || "Unknown User",
    actionType: "Logout",
    resourceType: "User",
    resourceId: session?.user?.id || "unknown",
    successMessage: "Logout bem-sucedido!",
    errorMessage: "Falha no logout.",
  };
  const wrappedAction = withActionLogging(logoutActionInternal, logConfig);
  return await wrappedAction();
};
