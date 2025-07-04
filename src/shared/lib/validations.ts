/**
 * @file `validations.ts` contém funções utilitárias para validação e formatação de dados.
 * Inclui validação de CPF usando Zod, formatação de CPF e sanitização de entradas.
 * @module Validations
 */

import { z } from 'zod';

/**
 * Esquema Zod para validação de CPF.
 * Realiza as seguintes validações:
 * - Remove caracteres não numéricos.
 * - Verifica se o CPF tem 11 dígitos.
 * - Impede CPFs com todos os dígitos iguais (ex: 111.111.111-11).
 * - Valida os dígitos verificadores do CPF.
 * @constant
 * @type {ZodString}
 */
const cpfSchema = z.string().refine(cpf => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  let remainder;

  // Validação do primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  // Validação do segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}, { message: 'CPF inválido.' });

/**
 * Valida um número de CPF usando o esquema `cpfSchema`.
 * @param {string} cpf - O CPF a ser validado.
 * @returns {boolean} `true` se o CPF for válido, `false` caso contrário.
 */
export function validateCPF(cpf: string): boolean {
  try {
    cpfSchema.parse(cpf);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Formata uma string de CPF, adicionando pontos e hífen.
 * Ex: "12345678900" se torna "123.456.789-00".
 * @param {string} cpf - O CPF a ser formatado (apenas dígitos).
 * @returns {string} O CPF formatado.
 */
export function formatCPF(cpf: string): string {
  // Remove tudo que não for dígito
  cpf = cpf.replace(/\D/g, '');

  // Aplica a máscara
  if (cpf.length > 9) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cpf.length > 6) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
  } else if (cpf.length > 3) {
    return cpf.replace(/(\d{3})(\d{3})/, '$1.$2');
  }
  return cpf;
}

/**
 * Sanitiza uma string de entrada, removendo tags HTML e espaços em branco extras.
 * Útil para prevenir ataques XSS (Cross-Site Scripting).
 * @param {string} input - A string de entrada a ser sanitizada.
 * @returns {string} A string sanitizada.
 */
export function sanitizeInput(input: string): string {
  // Remove tags HTML e caracteres especiais que podem ser usados em ataques XSS
  return input.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Valida se todos os campos obrigatórios em um objeto estão preenchidos.
 * @template T - O tipo do objeto de dados.
 * @param {T} data - O objeto de dados a ser validado.
 * @param {Array<keyof T>} fields - Um array de chaves que representam os campos obrigatórios.
 * @returns {string[]} Um array contendo os nomes dos campos que estão faltando ou vazios.
 */
export function validateRequiredFields<T extends Record<string, any>>(data: T, fields: Array<keyof T>): string[] {
  const missingFields: string[] = [];
  for (const field of fields) {
    if (!data[field] || String(data[field]).trim() === '') {
      missingFields.push(String(field));
    }
  }
  return missingFields;
}
