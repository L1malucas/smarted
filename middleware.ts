/**
 * @file `middleware.ts` é responsável por interceptar requisições HTTP no Next.js
 * para aplicar lógica de autenticação e autorização antes que as requisições
 * cheguem às rotas da aplicação. Ele verifica a presença e validade de tokens
 * de acesso e redireciona usuários não autenticados para a página de login.
 * @module Middleware
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/public"];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // If trying to access a public path
  if (isPublicPath(pathname)) {
    // If logged in, redirect from /login to dashboard
    if (pathname.startsWith("/login") && accessToken) {
      const decoded = await verifyToken(accessToken);
      if (decoded && decoded.tenantId) {
        return NextResponse.redirect(new URL(`/${decoded.tenantId}/dashboard`, request.url));
      }
    }
    // Allow access to public paths
    return NextResponse.next();
  }

  // Logic for protected paths
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const decoded = await verifyToken(accessToken);

  if (!decoded) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
