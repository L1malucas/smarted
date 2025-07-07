/**
 * @interface IUploadFile
 * @description Represents a file being uploaded.
 */
export interface IUploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}
