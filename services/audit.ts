import { AuditLog } from '@/types/audit-interface';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'SmartEdDB';
const DB_VERSION = 1;
const AUDIT_STORE = 'audit_logs';

export class AuditService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(AUDIT_STORE)) {
          const auditStore = db.createObjectStore(AUDIT_STORE, { keyPath: '_id' });
          auditStore.createIndex('timestamp', 'timestamp');
          auditStore.createIndex('userId', 'userId');
          auditStore.createIndex('actionType', 'actionType');
          auditStore.createIndex('resourceType', 'resourceType');
          auditStore.createIndex('resourceId', 'resourceId');
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAuditLog(log: Omit<AuditLog, '_id' | 'timestamp'>): Promise<AuditLog> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIT_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIT_STORE);

      const auditLog: AuditLog = {
        ...log,
        _id: uuidv4(),
        timestamp: new Date(),
      };

      const request = store.add(auditLog);
      request.onsuccess = () => resolve(auditLog);
      request.onerror = () => reject(request.error);
    });
  }

  async getAuditLogsByResource(resourceType: AuditLog['resourceType'], resourceId?: string): Promise<AuditLog[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIT_STORE], 'readonly');
      const store = transaction.objectStore(AUDIT_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const logs = request.result.filter(
          (log: AuditLog) =>
            log.resourceType === resourceType && (!resourceId || log.resourceId === resourceId)
        );
        resolve(logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIT_STORE], 'readonly');
      const store = transaction.objectStore(AUDIT_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const logs = request.result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }
}