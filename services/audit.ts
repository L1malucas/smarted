
import Log, { ILog } from '@/models/Log';
import dbConnect from '@/lib/mongodb';
import { AuditLog } from '@/types/audit-interface';

export class AuditService {
  constructor() {
    // No need to initialize IndexedDB here
  }

  async saveAuditLog(log: Omit<AuditLog, '_id' | 'timestamp'>): Promise<ILog> {
    try {
      await dbConnect();
      const newLog = new Log({
        userId: log.userId,
        userName: log.userName,
        actionType: log.actionType,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        details: log.details,
        success: log.success,
        // Mongoose will automatically add timestamp due to `timestamps: true` in schema
      });
      await newLog.save();
      return newLog;
    } catch (error) {
      console.error('Erro ao salvar log de auditoria no MongoDB:', error);
      throw new Error('Falha ao salvar log de auditoria.');
    }
  }

  async getAuditLogsByResource(resourceType: string, resourceId?: string): Promise<ILog[]> {
    try {
      await dbConnect();
      const query: any = { resourceType };
      if (resourceId) {
        query.resourceId = resourceId;
      }
      const logs = await Log.find(query).sort({ timestamp: -1 });
      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria por recurso no MongoDB:', error);
      throw new Error('Falha ao buscar logs de auditoria.');
    }
  }

  async getAllAuditLogs(): Promise<ILog[]> {
    try {
      await dbConnect();
      const logs = await Log.find({}).sort({ timestamp: -1 });
      return logs;
    } catch (error) {
      console.error('Erro ao buscar todos os logs de auditoria no MongoDB:', error);
      throw new Error('Falha ao buscar todos os logs de auditoria.');
    }
  }
}