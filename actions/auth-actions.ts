/**
 * @file `auth-actions.ts` contém as Server Actions relacionadas à autenticação de usuários.
 * Estas funções são executadas no lado do servidor e lidam com o login, logout e a atualização
 * de tokens de acesso, interagindo diretamente com o banco de dados e gerenciando os cookies de sessão.
 * @module AuthActions
 */

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUsersCollection } from '../lib/db';
import { sanitizeInput, validateCPF } from '../lib/validations';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../lib/auth';
import { withActionLogging } from '@/lib/actions';
import { ActionLogConfig } from '@/types/action-interface';
import { saveAuditLog } from '@/services/audit';
import { verifyToken } from '@/lib/auth';

async function getSession() {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) {
    return {
      userId: null,
      userName: "Sistema",
    };
  }
  try {
    const decoded = await verifyToken(accessToken);
    if (decoded) {
      return {
        userId: decoded.userId,
        userName: decoded.name || "Unknown User",
      };
    }
  } catch (error) {
    // Log this error internally, as it's a session issue before a user action
    await saveAuditLog({
      userId: "",
      userName: "Sistema",
      actionType: "Erro de Sessão",
      resourceType: "Autenticação",
      resourceId: "",
      details: `Erro ao obter sessão em auth-actions: ${error instanceof Error ? error.message : String(error)}`,
      success: false,
    });
  }
  return {
    userId: null,
    userName: "Sistema",
  };
}

/**
 * Opções padrão para a configuração de cookies de autenticação.
 * Garante que os cookies sejam seguros, acessível apenas via HTTP (httpOnly),
 * e restritos ao mesmo site (sameSite: 'strict').
 * @constant
 * @type {object}
 * @property {boolean} httpOnly - Impede o acesso ao cookie via JavaScript do lado do cliente.
 * @property {boolean} secure - Envia o cookie apenas em requisições HTTPS (em produção).
 * @property {'strict' | 'lax' | 'none'} sameSite - Protege contra ataques CSRF.
 * @property {string} path - O caminho para o qual o cookie é válido.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as 'strict' | 'lax' | 'none',
  path: '/',
};

/**
 * Ação de servidor para realizar o login do usuário.
 * Valida o CPF fornecido, busca o usuário no banco de dados e, se encontrado,
 * gera e define os tokens de acesso e refresh nos cookies, redirecionando para a página inicial.
 *
 * @param {any} prevState - O estado anterior do formulário (usado por `useFormState`).
 * @param {FormData} formData - Os dados do formulário, contendo o CPF do usuário.
 * @returns {Promise<{ error: string } | void>} Um objeto com uma mensagem de erro se o login falhar,
 * ou redireciona o usuário em caso de sucesso.
 */
export async function loginAction(cpf: string) {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Login de Usuário",
    resourceType: "Autenticação",
    resourceId: cpf, // Using CPF as resourceId for login attempts
    successMessage: "Login realizado com sucesso!",
    errorMessage: "Falha no login.",
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
    const user = await usersCollection.findOne({ cpf });
    // console.log('User object from DB:', user); // Debug line

    if (!user) {
      throw new Error('CPF não encontrado.');
    }

    // For simplicity, assuming user is authenticated if found by CPF.
    // In a real app, you'd verify password here.

    const userPayload = {
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

    // Redirect to the tenant-specific dashboard
    const tenantSlug = user.tenantId || 'default';
    redirect(`/${tenantSlug}/dashboard`);
  };

  try {
    return await withActionLogging(loginActionInternal, logConfig)(cpf);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('NEXT_REDIRECT')
    ) {
      throw error;
    }
  }
}

/**
 * Ação de servidor para realizar o logout do usuário.
 * Remove os cookies de `accessToken` e `refreshToken` e redireciona o usuário para a página de login.
 *
 * @returns {void} Redireciona o usuário após o logout.
 */
export async function logoutAction() {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Logout de Usuário",
    resourceType: "Autenticação",
    resourceId: session.userId ?? "",
    successMessage: "Logout realizado com sucesso!",
    errorMessage: "Falha no logout.",
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
export async function refreshTokenAction() {
  const session = await getSession();
  const logConfig: ActionLogConfig = {
    userId: session.userId ?? "",
    userName: session.userName,
    actionType: "Atualização de Token",
    resourceType: "Autenticação",
    resourceId: session.userId ?? "",
    successMessage: "Token de acesso atualizado com sucesso!",
    errorMessage: "Falha na atualização do token.",
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

    const userPayload = {
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