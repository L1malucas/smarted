"use server";

import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { withActionLogging } from "@/shared/lib/actions";
import { IActionLogConfig, IActionResult } from "@/shared/types/types/action-interface";
import { getFilesCollection } from "@/infrastructure/persistence/db";
import { IFileMetadata } from "@/domain/models/FileMetadata";
import { ObjectId } from "mongodb";

const UPLOADS_BASE_DIR = path.join(process.cwd(), "public", "uploads");

// Helper to get absolute file path from a relative URL
function getAbsoluteFilePath(relativePath: string): string {
  // Ensure the path starts with /uploads/ to prevent directory traversal
  if (!relativePath.startsWith("/uploads/")) {
    throw new Error("Caminho de arquivo inválido. Deve começar com /uploads/");
  }
  return path.join(process.cwd(), "public", relativePath);
}

export const uploadResumeAction = withActionLogging(
  async (formData: FormData): Promise<string> => {
    const file = formData.get("resumeFile") as File;

    if (!file) {
      throw new Error("Nenhum arquivo de currículo fornecido.");
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error("O arquivo do currículo deve ter no máximo 5MB.");
    }

    if (file.type !== "application/pdf") {
      throw new Error("O currículo deve ser um arquivo PDF.");
    }

    const resumesDir = path.join(UPLOADS_BASE_DIR, "resumes");
    // Ensure directory exists
    await require('fs').promises.mkdir(resumesDir, { recursive: true });

    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(resumesDir, uniqueFileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const resumeUrl = `/uploads/resumes/${uniqueFileName}`;

    // Save file metadata to MongoDB
    const filesCollection = await getFilesCollection();
    const newFileMetadata: IFileMetadata = {
      _id: new ObjectId().toString(),
      fileName: uniqueFileName,
      originalFileName: file.name,
      filePath: resumeUrl,
      mimeType: file.type,
      size: file.size,
      uploadedByUserId: "public-candidate", // Placeholder, should come from authenticated user
      uploadedByUserName: "Public Candidate", // Placeholder, should come from authenticated user
      uploadDate: new Date(),
      associatedEntityType: "CandidateResume", // Specific type for resumes
      associatedEntityId: "", // Will be populated later if associated with a candidate/job
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await filesCollection.insertOne(newFileMetadata as any);

    return resumeUrl;
  },
  {
    userId: "public-candidate",
    userName: "Public Candidate",
    actionType: "Upload de Currículo",
    resourceType: "File",
    resourceId: "",
    success: false,
  } as IActionLogConfig
);

export const downloadFileAction = withActionLogging(
  async (fileUrl: string): Promise<Buffer> => {
    const absolutePath = getAbsoluteFilePath(fileUrl);
    try {
      const fileBuffer = await readFile(absolutePath);
      return fileBuffer;
    } catch (error) {
      throw new Error(`Falha ao baixar o arquivo: ${fileUrl}. Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  {
    userId: "system", // Or authenticated user ID if applicable
    userName: "System", // Or authenticated user name
    actionType: "Download de Arquivo",
    resourceType: "File",
    resourceId: "", // Will be populated by the fileUrl
    success: false,
  } as IActionLogConfig
);

export const deleteFileAction = withActionLogging(
  async (fileUrl: string): Promise<boolean> => {
    const absolutePath = getAbsoluteFilePath(fileUrl);
    try {
      // Delete metadata from MongoDB first
      const filesCollection = await getFilesCollection();
      const deleteResult = await filesCollection.deleteOne({ filePath: fileUrl });

      if (deleteResult.deletedCount === 0) {
        console.warn(`Metadados do arquivo não encontrados para exclusão: ${fileUrl}`);
      }

      // Then delete the file physically
      await unlink(absolutePath);
      return true;
    } catch (error) {
      throw new Error(`Falha ao excluir o arquivo: ${fileUrl}. Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  {
    userId: "system", // Or authenticated user ID if applicable
    userName: "System", // Or authenticated user name
    actionType: "Exclusão de Arquivo",
    resourceType: "File",
    resourceId: "", // Will be populated by the fileUrl
    success: false,
  } as IActionLogConfig
);
