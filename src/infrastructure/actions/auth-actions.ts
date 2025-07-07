/**
 * @file `auth-actions.ts` contém as Server Actions relacionadas à autenticação de usuários.
 * Estas funções são executadas no lado do servidor e lidam com o login, logout e a atualização
 * de tokens de acesso, interagindo diretamente com o banco de dados e gerenciando os cookies de sessão.
 * @module AuthActions
 */

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUsersCollection } from '@/infrastructure/persistence/db';
import { validateCPF } from '@/shared/lib/validations';
import { generateToken, generateRefreshToken, verifyRefreshToken, UserPayload } from '@/infrastructure/auth/auth';
import { withActionLogging } from '@/shared/lib/actions';
import { IActionLogConfig } from '@/shared/types/types/action-interface';
import { verifyToken } from '@/infrastructure/auth/auth';
import { IActionResult, IActionLogConfig } from '@/shared/types/types/action-interface';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

async function getSessionUser(): Promise<IUserPayload | null> {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) return null;
  return verifyToken(accessToken);
}

export async function loginAction(cpf: string): Promise<IActionResult<void>> {
  const logConfig: IActionLogConfig = {
    userId: "", // Will be populated after user is found
    userName: "", // Will be populated after user is found
    actionType: "Login de Usuário",
    resourceType: "Autenticação",
    resourceId: cpf, // Using CPF as resourceId for login attempts
    success: false
  };

  const loginActionInternal = async (cpf: string) => {
    if (!cpf) {
      throw new Error('CPF é obrigatório.');
    }

    if (!validateCPF(cpf)) {
      throw new Error('CPF inválido.');
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ cpf }) as IUser;

    if (!user) {
      throw new Error('CPF não encontrado.');
    }

    // Update logConfig with actual user data
    logConfig.userId = user._id.toString();
    logConfig.userName = user.name;

    const userPayload: IUserPayload = {
      userId: user._id.toString(),
      cpf: user.cpf,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      isAdmin: user.isAdmin,
      tenantId: user.tenantId,
    };

    const accessToken = generateToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    (await cookies()).set('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });
    (await cookies()).set('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 });

    const tenantSlug = user.tenantId || 'default';
    redirect(`/${tenantSlug}/dashboard`);
  };

  return await withActionLogging(loginActionInternal, logConfig)(cpf);
}


/**
 * Ação de servidor para realizar o logout do usuário.
 * Remove os cookies de `accessToken` e `refreshToken` e redireciona o usuário para a página de login.
 *
 * @returns {void} Redireciona o usuário após o logout.
 */
export async function logoutAction(): Promise<IActionResult<void>> {
  const sessionUser = await getSessionUser();

  const logConfig: IActionLogConfig = {
    userId: sessionUser?.userId ?? "anonymous",
    userName: sessionUser?.name ?? "Sistema",
    actionType: "Logout de Usuário",
    resourceType: "Autenticação",
    resourceId: sessionUser?.userId ?? "",
    success: false
  };

  const logoutActionInternal = async () => {
    (await cookies()).delete('accessToken');
    (await cookies()).delete('refreshToken');
    redirect('/login');
  };

  return await withActionLogging(logoutActionInternal, logConfig)();
}


/**
 * Ação de servidor para atualizar o token de acesso usando o refresh token.
 * Verifica a validade do refresh token e, se válido, gera um novo access token,
 * atualizando o cookie correspondente. Em caso de falha, limpa os cookies de autenticação.
 *
 * @returns {Promise<{ success: boolean; newAccessToken?: string; error?: string }>} Um objeto indicando o sucesso da operação,
 * o novo access token (se bem-sucedido) ou uma mensagem de erro.
 */
export async function refreshTokenAction(): Promise<IActionResult<{ newAccessToken: string }>> {
  const refreshToken = (await cookies()).get('refreshToken')?.value;
  const decoded = refreshToken ? await verifyRefreshToken(refreshToken) : null;

  const logConfig: IActionLogConfig = {
    userId: decoded?.userId ?? "anonymous",
    userName: decoded?.name ?? "Sistema",
    actionType: "Atualização de Token",
    resourceType: "Autenticação",
    resourceId: decoded?.userId ?? "",
    success: false
  };

  const refreshTokenActionInternal = async () => {
    const refreshToken = (await cookies()).get('refreshToken')?.value;

    if (!refreshToken) {
      throw new Error('No refresh token found.');
    }

    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      (await cookies()).delete('accessToken');
      (await cookies()).delete('refreshToken');
      throw new Error('Invalid refresh token.');
    }

    const userPayload: IUserPayload = {
      userId: decoded.userId,
      cpf: decoded.cpf,
      email: decoded.email,
      name: decoded.name,
      roles: decoded.roles,
      permissions: decoded.permissions,
      isAdmin: decoded.isAdmin,
      tenantId: decoded.tenantId,
    };

    const newAccessToken = generateToken(userPayload);
    (await cookies()).set('accessToken', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });

    return { success: true, newAccessToken };
  };

  return await withActionLogging(refreshTokenActionInternal, logConfig)();
}