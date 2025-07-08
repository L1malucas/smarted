
"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUsersCollection, getTenantsCollection } from '@/infrastructure/persistence/db';
import { validateCPF } from '@/shared/lib/validations';
import { generateToken, generateRefreshToken, verifyRefreshToken, verifyToken } from '@/infrastructure/auth/auth';
import { createLoggedAction } from '@/shared/lib/action-builder';
import { IUserPayload } from '@/shared/types/types/auth';
import { IUser } from '@/domain/models/User';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Obtém os dados do usuário da sessão a partir do accessToken.
 * Esta função não é uma action logada, pois é usada internamente para obter a sessão.
 */
export async function getSessionUser(): Promise<IUserPayload | null> {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) return null;
  try {
    return await verifyToken(accessToken);
  } catch (error) {
    // Token inválido ou expirado
    return null;
  }
}

/**
 * Realiza o login do usuário.
 */
export const loginAction = createLoggedAction<
  [string],
  void
>({
  actionName: "Login de Usuário",
  resourceType: "Autenticação",
  requireAuth: false, // Ação de login não requer autenticação prévia
  action: async ({ args: [cpf] }) => {
    if (!cpf || !validateCPF(cpf)) {
      throw new Error('CPF inválido ou não fornecido.');
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ cpf }) as IUser;

    if (!user) {
      throw new Error('CPF não encontrado.');
    }

    const tenantsCollection = await getTenantsCollection();
    const tenant = await tenantsCollection.findOne({ slug: user.tenantId });
    const tenantName = tenant?.name || 'Default Tenant';

    const userPayload: IUserPayload = {
      userId: user._id!.toString(),
      cpf: user.cpf,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      isAdmin: user.isAdmin,
      tenantId: user.tenantId,
      tenantName: tenantName,
    };

    const accessToken = generateToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const cookieStore = await cookies();
    cookieStore.set('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });
    cookieStore.set('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 });

    // O redirecionamento deve ser lançado como um erro para o Next.js tratar
    redirect(`/${user.tenantId}/dashboard`);
  },
  getResourceId: (result, args) => args[0], // Loga o CPF usado na tentativa
});

/**
 * Realiza o logout do usuário.
 */
export const logoutAction = createLoggedAction<
  [],
  void
>({
  actionName: "Logout de Usuário",
  resourceType: "Autenticação",
  requireAuth: true, // Apenas usuários logados podem deslogar
  action: async () => {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    redirect('/login');
  },
});

/**
 * Atualiza o token de acesso usando o refresh token.
 */
export const refreshTokenAction = createLoggedAction<
  [],
  { newAccessToken: string }
>({
  actionName: "Atualização de Token",
  resourceType: "Autenticação",
  requireAuth: false, // Pode ser chamado sem um accessToken válido
  action: async () => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      throw new Error('Refresh token não encontrado.');
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      throw new Error('Refresh token inválido.');
    }

    const userPayload: IUserPayload = { ...decoded };
    const newAccessToken = generateToken(userPayload);
    cookieStore.set('accessToken', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });

    return { newAccessToken };
  },
});
