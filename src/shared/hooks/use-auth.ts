'use client';

import { loginAction, logoutAction } from "@/infrastructure/actions/auth-actions";

export function useAuth() {
  const clientSignIn = async (payload: { cpf: string }) => {
    // Call the server action directly
    const result = await loginAction(payload.cpf);
    if (result.success) {
      return { success: true, user: result.user as IUser };
    } else {
      return { success: false, error: result.error };
    }
  };

  const clientSignOut = async () => {
    await logoutAction();
  };

  return { clientSignIn, clientSignOut };
}