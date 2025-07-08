"use server";

import { getLogsCollection } from "../persistence/db";
import { IActionLogConfig } from "@/shared/types/types/action-interface";
import { ObjectId } from "mongodb";

/**
 * Salva um registro de log de auditoria no banco de dados.
 * @param logData - Os dados do log a serem salvos.
 */
export async function saveAuditLog(logData: IActionLogConfig) {
  try {
    const logsCollection = await getLogsCollection();
    const logEntry = {
      ...logData,
      _id: new ObjectId(),
      timestamp: new Date(),
    };
    await logsCollection.insertOne(logEntry as any);
  } catch (error) {
    console.error("Falha ao salvar o log de auditoria:", error);
    // Em um cenário de produção, considere um logger mais robusto ou um fallback.
  }
}
