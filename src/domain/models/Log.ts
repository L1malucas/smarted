
export interface ILog {
  _id?: string; 
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  success: boolean;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
}
