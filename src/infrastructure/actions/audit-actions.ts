'use server';

import { IActionLogConfig } from "@/shared/types/types/action-interface";
import { saveAuditLog } from "../logging/audit";

export async function saveAuditLogAction(logConfig: ActionLogConfig) {
  await saveAuditLog(logConfig);
}
