"use server";

import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";
import { createLoggedAction } from "@/shared/lib/action-builder";
import { getFilesCollection } from "@/infrastructure/persistence/db";
import { IFileMetadata } from "@/domain/models/FileMetadata";

const UPLOADS_BASE_DIR = path.join(process.cwd(), "public", "uploads");

// Helper para obter o caminho absoluto do arquivo a partir de uma URL relativa
function getAbsoluteFilePath(relativePath: string): string {
  if (!relativePath.startsWith("/uploads/")) {
    throw new Error("Caminho de arquivo inválido. Deve começar com /uploads/");
  }
  return path.join(process.cwd(), "public", relativePath);
}

/**
 * Realiza o upload de um currículo.
 * Ação pública, mas loga a tentativa de upload.
 */
export const uploadResumeAction = createLoggedAction<
  [FormData],
  string // Retorna a URL do arquivo
>({
  actionName: "Upload de Currículo",
  resourceType: "File",
  requireAuth: false, // Ação pública para candidatos
  action: async ({ session, args: [formData] }) => {
    const file = formData.get("resume") as File;

    if (!file) throw new Error("Nenhum arquivo de currículo fornecido.");
    if (file.size > 5 * 1024 * 1024) throw new Error("O arquivo deve ter no máximo 5MB.");
    if (file.type !== "application/pdf") throw new Error("O currículo deve ser um arquivo PDF.");

    const resumesDir = path.join(UPLOADS_BASE_DIR, "resumes");
    await mkdir(resumesDir, { recursive: true });

    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(resumesDir, uniqueFileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    const resumeUrl = `/uploads/resumes/${uniqueFileName}`;

    const filesCollection = await getFilesCollection();
    const newFileMetadata: Omit<IFileMetadata, '_id'> = {
      fileName: uniqueFileName,
      originalFileName: file.name,
      filePath: resumeUrl,
      mimeType: file.type,
      size: file.size,
      // Se a sessão existir (um usuário logado fazendo upload), usa os dados dele.
      // Caso contrário, usa um placeholder para candidatos públicos.
      uploadedByUserId: session?.userId ?? "public-candidate",
      uploadedByUserName: session?.name ?? "Public Candidate",
      uploadDate: new Date(),
      associatedEntityType: "CandidateResume",
      associatedEntityId: "", // Pode ser preenchido posteriormente
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await filesCollection.insertOne(newFileMetadata as any);

    return resumeUrl;
  },
  getResourceId: (result) => result, // A URL do arquivo é o ID do recurso
  getDetails: (result, error) => error ? `Erro: ${error.message}` : `Upload bem-sucedido: ${result}`
});

/**
 * Realiza o download de um arquivo.
 */
export const downloadFileAction = createLoggedAction<
  [string], // fileUrl
  Buffer
>({
  actionName: "Download de Arquivo",
  resourceType: "File",
  requireAuth: true, // Apenas usuários autenticados podem baixar
  action: async ({ args: [fileUrl] }) => {
    const absolutePath = getAbsoluteFilePath(fileUrl);
    try {
      return await readFile(absolutePath);
    } catch (error) {
      throw new Error(`Falha ao baixar o arquivo: ${fileUrl}.`);
    }
  },
  getResourceId: (_, args) => args[0],
});

/**
 * Exclui um arquivo físico e seus metadados.
 */
export const deleteFileAction = createLoggedAction<
  [string], // fileUrl
  boolean
>({
  actionName: "Exclusão de Arquivo",
  resourceType: "File",
  requireAuth: true, // Apenas usuários autenticados podem excluir
  action: async ({ args: [fileUrl] }) => {
    const absolutePath = getAbsoluteFilePath(fileUrl);
    try {
      const filesCollection = await getFilesCollection();
      const deleteResult = await filesCollection.deleteOne({ filePath: fileUrl });

      if (deleteResult.deletedCount === 0) {
        console.warn(`Metadados do arquivo não encontrados para exclusão: ${fileUrl}`);
      }

      await unlink(absolutePath);
      return true;
    } catch (error) {
      throw new Error(`Falha ao excluir o arquivo: ${fileUrl}.`);
    }
  },
  getResourceId: (_, args) => args[0],
});