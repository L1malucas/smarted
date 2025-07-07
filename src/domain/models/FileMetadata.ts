import { IBaseEntity } from "./base/BaseEntity";

export interface IFileMetadata extends IBaseEntity {
  fileName: string;
  originalFileName: string;
  filePath: string; 
  mimeType: string;
  size: number;
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadDate: Date;
  associatedEntityType?: string; 
  associatedEntityId?: string; 
}