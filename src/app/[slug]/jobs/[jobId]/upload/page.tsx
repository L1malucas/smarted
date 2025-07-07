"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { ArrowLeft, Upload, X, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { uploadResumeAction } from "@/infrastructure/actions/file-actions";
import { toast } from "@/shared/components/ui/use-toast";
import { IUploadFile } from "@/shared/types/types/upload-file"

export default function UploadPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const jobSlugParam = params.jobId as string 
  const router = useRouter()
  const [files, setFiles] = useState<IUploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.type !== "application/pdf") {
        alert(`${file.name} não é um arquivo PDF válido`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        alert(`${file.name} é muito grande (máximo 10MB)`)
        return false
      }
      return true
    })

    const uploadFiles: IUploadFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "pending",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...uploadFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const uploadFiles = async () => {
    for (const uploadFile of files.filter((f) => f.status === "pending")) {
      setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" } : f)));

      try {
        const result = await uploadResumeAction(jobSlugParam, uploadFile.file);
        if (result.success) {
          setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "completed", progress: 100 } : f)));
          toast({
            title: "Upload Concluído",
            description: `O currículo ${uploadFile.file.name} foi enviado com sucesso.`, 
          });
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "error",
                    error: result.error || "Erro desconhecido no upload",
                  }
                : f,
            ),
          );
          toast({
            title: "Erro no Upload",
            description: result.error || "Não foi possível enviar o currículo.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "error",
                  error: error instanceof Error ? error.message : String(error),
                }
              : f,
          ),
        );
        toast({
          title: "Erro Inesperado",
          description: "Ocorreu um erro inesperado durante o upload.",
          variant: "destructive",
        });
      }
    }
  };

  const startAnalysis = () => {
    router.push(`/${tenantSlug}/jobs/${jobSlugParam}/candidates`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "uploading":
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      uploading: "default",
      completed: "default",
      error: "destructive",
    } as const

    const labels = {
      pending: "Pendente",
      uploading: "Enviando",
      completed: "Concluído",
      error: "Erro",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const completedFiles = files.filter((f) => f.status === "completed").length
  const hasFiles = files.length > 0
  const canStartAnalysis = completedFiles > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${tenantSlug}/jobs`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Upload de Currículos</h1>
          <p className="text-muted-foreground">Vaga: Desenvolvedor Frontend Sênior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Arquivos</CardTitle>
            <CardDescription>Arraste e solte arquivos PDF ou clique para selecionar</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Arraste arquivos aqui</h3>
              <p className="text-muted-foreground mb-4">ou</p>
              <Button asChild>
                <label className="cursor-pointer">
                  Selecionar Arquivos
                  <input type="file" multiple accept=".pdf" onChange={handleFileSelect} className="hidden" />
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">Apenas arquivos PDF, máximo 10MB cada</p>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Selecionados ({files.length})</CardTitle>
            {hasFiles && (
              <div className="flex gap-2">
                <Button onClick={uploadFiles} disabled={files.every((f) => f.status !== "pending")}>
                  Enviar Arquivos
                </Button>
                {canStartAnalysis && (
                  <Button onClick={startAnalysis} variant="outline">
                    Iniciar Análise
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!hasFiles ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum arquivo selecionado</div>
            ) : (
              <div className="space-y-3">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {getStatusBadge(uploadFile.status)}
                      </div>
                      {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="mt-2" />}
                      {uploadFile.error && <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === "uploading"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {hasFiles && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{files.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {files.filter((f) => f.status === "uploading").length}
                </p>
                <p className="text-sm text-muted-foreground">Enviando</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedFiles}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{files.filter((f) => f.status === "error").length}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
