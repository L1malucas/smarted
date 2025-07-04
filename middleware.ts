/**
 * @file `middleware.ts` é responsável por interceptar requisições HTTP no Next.js
 * para aplicar lógica de autenticação e autorização antes que as requisições
 * cheguem às rotas da aplicação. Ele verifica a presença e validade de tokens
 * de acesso e redireciona usuários não autenticados para a página de login.
 * @module Middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

/**
 * Função middleware principal que é executada para cada requisição.
 * Ela verifica se a rota acessada é protegida e, em caso afirmativo,
 * valida os tokens de acesso e refresh. Se o token de acesso for inválido
 * ou inexistente, o usuário é redirecionado para a página de login.
 *
 * @param {NextRequest} request - O objeto de requisição do Next.js, contendo informações sobre a requisição HTTP.
 * @returns {Promise<NextResponse>} Uma promessa que resolve para um objeto `NextResponse`,
 * que pode ser um redirecionamento para a página de login ou a continuação da requisição.
 */
export async function middleware(request: NextRequest) {
  console.log('Middleware: Executing for path:', request.nextUrl.pathname);
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const protectedPaths = ['/home']; // Add paths that require authentication
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedRoute) {
    if (!accessToken) {
      // If no access token, try to refresh or redirect to login
      if (refreshToken) {
        // In a real application, you'd make an API call to refresh the token here
        // For now, we'll just redirect to login if no valid access token
        console.log('Middleware: No access token, but refresh token exists. Redirecting to login.');
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('Middleware: Access Token:', accessToken);
    console.log('Middleware: JWT_SECRET (from process.env):', process.env.JWT_SECRET);
    const decoded = await verifyToken(accessToken);
    console.log('Middleware: Decoded Token:', decoded);
    if (!decoded) {
      // Invalid access token, redirect to login
      console.log('Middleware: Invalid access token. Redirecting to login.');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/login'], // Apply middleware to these paths
};
