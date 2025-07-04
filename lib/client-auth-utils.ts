/**
 * @file `client-auth-utils.ts` contém funções utilitárias para manipulação de tokens de autenticação
 * no lado do cliente. Atualmente, ele fornece uma função para extrair o tempo de expiração de um token JWT.
 * @module ClientAuthUtils
 */

import jwt from 'jsonwebtoken';

/**
 * Extrai o tempo de expiração (timestamp em milissegundos) de um token JWT.
 * Esta função decodifica o token e retorna o valor do campo `exp` (expiration time),
 * convertido para milissegundos para facilitar comparações com `Date.now()`.
 *
 * @param {string} token - O token JWT a ser decodificado.
 * @returns {number | null} O timestamp de expiração em milissegundos, ou `null` se o token for inválido
 * ou não contiver a informação de expiração.
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    return decoded?.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    return null;
  }
}
