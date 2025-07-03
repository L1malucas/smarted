'use server';

import { z } from 'zod';
import { loginSchema, LoginInput } from '@/lib/schemas/auth.schema';
import User, { IUser } from '@/models/User';
import databasePromise from '@/lib/mongodb';
import { withActionLogging } from '@/lib/actions';
import { ActionLogConfig } from '@/types/action-interface';

// Placeholder for session management. In a real app, use NextAuth.js or similar.
async function createSession(user: IUser) {
  // Simulate session creation
}

// Updated getSession to return userName
async function getSession() {
  return {
    userId: "dummyUserId123",
    userName: "Dummy User",
    tenantId: "dummyTenantId456",
    roles: ["admin"], // or "recruiter"
  };
}

async function loginActionInternal(payload: LoginInput) {
  const validatedData = loginSchema.parse(payload);
  const { cpf } = validatedData;

  const db = await databasePromise;
  const user = await User.findOne({ cpf });

  if (!user) {
    return { success: false, error: 'CPF inválido ou não autorizado.' };
  }

  await createSession(user);

  return { success: true, data: { user: user.toObject() } };
}

async function logoutActionInternal(): Promise<{ success: boolean, error?: string }> {
  return { success: true };
}

// Exported functions that wrap the internal actions with logging
export const loginAction = async (payload: LoginInput) => {
  const session = await getSession(); // Get session before calling the wrapped action
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Login",
    resourceType: "User",
    resourceId: "", // Will be populated with user ID after successful login
    successMessage: "Login bem-sucedido!",
    errorMessage: "Falha no login.",
  };
  const wrappedAction = withActionLogging(loginActionInternal, logConfig);
  const result = await wrappedAction(payload);
  // If login is successful, update resourceId in logConfig for audit trail
  if (result.success && result.data && result.data.user) {
    logConfig.resourceId = result.data.user._id.toString();
  }
  return result;
};

export const logoutAction = async () => {
  const session = await getSession(); // Get session before calling the wrapped action
  const logConfig: ActionLogConfig = {
    userId: session.userId,
    userName: session.userName,
    actionType: "Logout",
    resourceType: "User",
    resourceId: session.userId, // User ID is known before logout
    successMessage: "Logout bem-sucedido!",
    errorMessage: "Falha no logout.",
  };
  const wrappedAction = withActionLogging(logoutActionInternal, logConfig);
  return await wrappedAction();
};