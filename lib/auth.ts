/**
 * @file `auth.ts` contém funções utilitárias para autenticação e autorização.
 * Ele lida com a geração, verificação e hash de tokens JWT (JSON Web Tokens)
 * e senhas, utilizando bibliotecas como `jsonwebtoken`, `jose` e `bcryptjs`.
 * @module AuthLib
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Interface que define a estrutura do payload do usuário a ser incluído nos tokens JWT.
 * @typedef {object} UserPayload
 * @property {string} userId - O ID único do usuário.
 * @property {string} cpf - O CPF do usuário.
 * @property {string} email - O endereço de e-mail do usuário.
 * @property {string} name - O nome completo do usuário.
 * @property {string[]} roles - Uma lista de papéis (roles) atribuídos ao usuário.
 * @property {string[]} permissions - Uma lista de permissões específicas do usuário.
 * @property {boolean} isAdmin - Indica se o usuário possui privilégios de administrador.
 * @property {string} tenantId - O ID do tenant (inquilino) ao qual o usuário pertence.
 */
interface UserPayload {
  userId: string;
  cpf: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  tenantId: string;
}

/**
 * Chave secreta para assinar e verificar tokens de acesso JWT.
 * Obtida das variáveis de ambiente (`process.env.JWT_SECRET`).
 * @constant
 * @type {string}
 */
const JWT_SECRET = process.env.JWT_SECRET as string;
console.log('Auth Lib: JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO');

/**
 * Chave secreta para assinar e verificar tokens de refresh JWT.
 * Obtida das variáveis de ambiente (`process.env.JWT_REFRESH_SECRET`).
 * @constant
 * @type {string}
 */
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
console.log('Auth Lib: JWT_REFRESH_SECRET loaded:', JWT_REFRESH_SECRET ? 'YES' : 'NO');

/**
 * Tempo de expiração para tokens de acesso JWT.
 * Padrão: '15m' (15 minutos). Pode ser configurado via `process.env.JWT_EXPIRES_IN`.
 * @constant
 * @type {string}
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

/**
 * Tempo de expiração para tokens de refresh JWT.
 * Padrão: '7d' (7 dias). Pode ser configurado via `process.env.JWT_REFRESH_EXPIRES_IN`.
 * @constant
 * @type {string}
 */
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Verifica se as chaves secretas JWT estão definidas, lançando um erro se não estiverem.
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in .env.local');
}

/**
 * Versão codificada da chave secreta JWT para uso com a biblioteca `jose`.
 * @constant
 * @type {Uint8Array}
 */
const encodedJwtSecret = new TextEncoder().encode(JWT_SECRET);

/**
 * Versão codificada da chave secreta do refresh token para uso com a biblioteca `jose`.
 * @constant
 * @type {Uint8Array}
 */
const encodedJwtRefreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET);

/**
 * Gera um novo token de acesso JWT com base no payload do usuário.
 * O token é assinado com `JWT_SECRET` e tem um tempo de expiração definido por `JWT_EXPIRES_IN`.
 *
 * @param {UserPayload} payload - Os dados do usuário a serem incluídos no token.
 * @returns {string} O token de acesso JWT gerado.
 */
export function generateToken(payload: UserPayload): string {
  console.log('Auth Lib: Generating token with payload:', payload);
  console.log('Auth Lib: JWT_SECRET used for signing:', JWT_SECRET);
  console.log('Auth Lib: JWT_EXPIRES_IN used for signing:', JWT_EXPIRES_IN);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  console.log('Auth Lib: Generated token:', token);
  return token;
}

/**
 * Gera um novo token de refresh JWT com base no payload do usuário.
 * O token é assinado com `JWT_REFRESH_SECRET` e tem um tempo de expiração definido por `JWT_REFRESH_EXPIRES_IN`.
 *
 * @param {UserPayload} payload - Os dados do usuário a serem incluídos no token de refresh.
 * @returns {string} O token de refresh JWT gerado.
 */
export function generateRefreshToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verifica a validade de um token de acesso JWT.
 * Decodifica o token usando `encodedJwtSecret` e retorna o payload se for válido.
 *
 * @param {string} token - O token de acesso JWT a ser verificado.
 * @returns {Promise<UserPayload | null>} Uma promessa que resolve para o payload do usuário se o token for válido,
 * ou `null` se a verificação falhar (token inválido, expirado, etc.).
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    console.log('Auth Lib: Verifying token:', token);
    const { payload } = await jwtVerify(token, encodedJwtSecret);
    console.log('Auth Lib: Token verified, payload:', payload);
    return payload as unknown as UserPayload;
  } catch (error) {
    console.error('Auth Lib: Token verification failed:', error);
    return null;
  }
}

/**
 * Verifica a validade de um token de refresh JWT.
 * Decodifica o token usando `encodedJwtRefreshSecret` e retorna o payload se for válido.
 *
 * @param {string} token - O token de refresh JWT a ser verificado.
 * @returns {Promise<UserPayload | null>} Uma promessa que resolve para o payload do usuário se o token for válido,
 * ou `null` se a verificação falhar.
 */
export async function verifyRefreshToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedJwtRefreshSecret);
    return payload as unknown as UserPayload;
  } catch (error) {
    console.error('Auth Lib: Refresh Token verification failed:', error);
    return null;
  }
}

/**
 * Gera um hash seguro de uma senha usando `bcryptjs`.
 * @param {string} password - A senha em texto claro a ser hashed.
 * @returns {Promise<string>} Uma promessa que resolve para o hash da senha.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara uma senha em texto claro com um hash de senha existente.
 * @param {string} password - A senha em texto claro a ser comparada.
 * @param {string} hashedPassword - O hash da senha armazenado.
 * @returns {Promise<boolean>} Uma promessa que resolve para `true` se as senhas coincidirem,
 * ou `false` caso contrário.
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}