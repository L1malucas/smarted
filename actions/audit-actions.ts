'use server';

import { saveAuditLog as saveAuditLogService } from '@/services/audit';
import { ActionLogConfig } from '@/types/action-interface';

export async function saveAuditLogAction(logConfig: ActionLogConfig) {
  await saveAuditLogService(logConfig);
}
