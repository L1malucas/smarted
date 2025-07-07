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
  const cleanedCpf = cpf.replace(/\D/g, '');

  if (cleanedCpf.length !== 11) return false;

  // Elimina CPFs inválidos conhecidos
  if (cleanedCpf === "00000000000" ||
      cleanedCpf === "11111111111" ||
      cleanedCpf === "22222222222" ||
      cleanedCpf === "33333333333" ||
      cleanedCpf === "44444444444" ||
      cleanedCpf === "55555555555" ||
      cleanedCpf === "66666666666" ||
      cleanedCpf === "77777777777" ||
      cleanedCpf === "88888888888" ||
      cleanedCpf === "99999999999")
      return false;

  // Valida 1o digito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanedCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanedCpf.charAt(9))) return false;

  // Valida 2o digito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanedCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanedCpf.charAt(10))) return false;

  return true;
}, { message: 'CPF inválido.' });

/**
 * Valida um número de CPF usando o esquema `cpfSchema`.
 * @param {string} cpf - O CPF a ser validado.
 * @returns {boolean} `true` se o CPF for válido, `false` caso contrário.
 */
export function validateCPF(cpf: string): boolean {
  try {
    const cleanedCpf = cpf.replace(/\D/g, '');
    console.log("Validating CPF (cleaned):", cleanedCpf);
    cpfSchema.parse(cleanedCpf);
    return true;
  } catch (error) {
    console.error("CPF validation error:", error);
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
