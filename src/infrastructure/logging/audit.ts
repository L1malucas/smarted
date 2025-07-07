import { ILog } from '@/domain/models/Log';
import { getLogsCollection } from '@/infrastructure/persistence/db';
import { IAuditLog } from '@/domain/models/AuditLog';

export async function saveAuditLog(log: Omit<IAuditLog, '_id' | 'timestamp'> & { tenantId: string; tenantName?: string }): Promise<IAuditLog> {
  try {
    const logsCollection = await getLogsCollection();
    const newLog: ILog = {
      userId: log.userId,
      userName: log.userName,
      actionType: log.actionType,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      details: log.details,
      success: log.success,
      timestamp: new Date(),
      tenantId: log.tenantId,
      tenantName: log.tenantName || 'Unknown Tenant',
    };
    const result = await logsCollection.insertOne(newLog);
    return { ...newLog, _id: result.insertedId };
  } catch (error) {
    throw new Error('Falha ao salvar log de auditoria.');
  }
}

export async function getAuditLogsByResource(resourceType: string, tenantId: string, resourceId?: string): Promise<IAuditLog[]> {
  try {
    const logsCollection = await getLogsCollection();
    const query: any = { resourceType, tenantId };
    if (resourceId) {
      query.resourceId = resourceId;
    }
    const logs = await logsCollection.find(query).sort({ timestamp: -1 }).toArray() as ILog[];
    return logs;
  } catch (error) {
    throw new Error('Falha ao buscar logs de auditoria.');
  }
}

export async function getAllAuditLogs(tenantId: string): Promise<IAuditLog[]> {
  try {
    const logsCollection = await getLogsCollection();
    const logs = await logsCollection.find({ tenantId }).sort({ timestamp: -1 }).toArray() as ILog[];
    return logs;
  } catch (error) {
    throw new Error('Falha ao buscar todos os logs de auditoria.');
  }
}