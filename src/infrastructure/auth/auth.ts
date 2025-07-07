/**
 * @file `auth.ts` contém funções utilitárias para autenticação e autorização.
 * Ele lida com a geração, verificação e hash de tokens JWT (JSON Web Tokens)
 * e senhas, utilizando bibliotecas como `jsonwebtoken`, `jose` e `bcryptjs`.
 * @module AuthLib
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { IUserPayload } from '@/shared/types/types/auth';

const JWT_SECRET = process.env.JWT_SECRET as string;
console.log('Auth Lib: JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO');

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
console.log('Auth Lib: JWT_REFRESH_SECRET loaded:', JWT_REFRESH_SECRET ? 'YES' : 'NO');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in .env.local');
}

const encodedJwtSecret = new TextEncoder().encode(JWT_SECRET);
const encodedJwtRefreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET);

export function generateToken(payload: IUserPayload): string {
  console.log('Auth Lib: Generating token with payload:', payload);
  console.log('Auth Lib: JWT_SECRET used for signing:', JWT_SECRET);
  console.log('Auth Lib: JWT_EXPIRES_IN used for signing:', JWT_EXPIRES_IN);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  console.log('Auth Lib: Generated token:', token);
  return token;
}

export function generateRefreshToken(payload: IUserPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export async function verifyToken(token: string): Promise<IUserPayload | null> {
  try {
    console.log('Auth Lib: Verifying token:', token);
    const { payload } = await jwtVerify(token, encodedJwtSecret);
    console.log('Auth Lib: Token verified, payload:', payload);
    return payload as unknown as IUserPayload;
  } catch (error) {
    console.error('Auth Lib: Token verification failed:', error);
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<IUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedJwtRefreshSecret);
    return payload as unknown as IUserPayload;
  } catch (error) {
    console.error('Auth Lib: Refresh Token verification failed:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}