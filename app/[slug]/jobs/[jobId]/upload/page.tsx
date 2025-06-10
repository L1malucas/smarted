"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface UploadFile {
  id: string
  file: File
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  error?: string
}

/**
 * @fileoverview Página de upload de currículos para uma vaga específica
 * @module UploadPage
 * 
 * @description
 * Este componente renderiza uma página que permite o upload de currículos em PDF para uma vaga específica.
 * Ele gerencia o estado dos arquivos enviados, fornece interface drag-and-drop, validação de arquivos
 * e feedback visual do progresso de upload.
 *
 * @requires useParams - Hook para acessar parâmetros da URL
 * @requires useRouter - Hook para navegação
 * @requires useState - Hook para gerenciamento de estado
 * @requires useCallback - Hook para memorização de funções
 *
 * @typedef {Object} UploadFile
 * @property {string} id - Identificador único do arquivo
 * @property {File} file - Objeto File do arquivo
 * @property {'pending' | 'uploading' | 'completed' | 'error'} status - Estado atual do upload
 * @property {number} progress - Progresso do upload (0-100)
 * @property {string} [error] - Mensagem de erro, se houver
 *
 * @state {UploadFile[]} files - Array de arquivos sendo gerenciados
 * @state {boolean} isDragOver - Indica se há um arquivo sendo arrastado sobre a área de upload
 *
 * @param {Object} params
 * @param {string} params.slug - Slug do tenant (organização)
 * @param {string} params.jobId - ID ou slug da vaga
 *
 * @callbacks
 * - handleDragOver: Gerencia o evento de arrastar arquivo sobre a área
 * - handleDragLeave: Gerencia o evento de saída do arquivo da área
 * - handleDrop: Processa os arquivos quando são soltos na área
 * - handleFileSelect: Processa os arquivos selecionados via input
 * - addFiles: Valida e adiciona novos arquivos à lista
 * - removeFile: Remove um arquivo da lista
 * - uploadFiles: Realiza o upload simulado dos arquivos
 * - startAnalysis: Redireciona para a página de análise de candidatos
 *
 * @validations
 * - Aceita apenas arquivos PDF
 * - Tamanho máximo por arquivo: 10MB
 *
 * @ui
 * - Área de drag-and-drop
 * - Lista de arquivos com status
 * - Progresso de upload
 * - Sumário com estatísticas
 * - Botões de ação (upload e análise)
 *
 * @navigation
 * - Volta para lista de vagas: /{tenantSlug}/jobs
 * - Avança para análise: /{tenantSlug}/jobs/{jobId}/candidates
 *
 * @todo
 * - Implementar upload real para API
 * - Adicionar validação de quantidade máxima de arquivos
 * - Adicionar tratamento de erros específicos
 * - Implementar persistência de estado
 */
export default function UploadPage() {
  const params = useParams()
  const tenantSlug = params.slug as string
  const jobSlugParam = params.jobId as string // Assuming this is the job's slug or ID
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
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

    const uploadFiles: UploadFile[] = validFiles.map((file) => ({
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
      setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" } : f)))

      try {
        // Simular upload com progresso
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
        }

        setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "completed", progress: 100 } : f)))
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "error",
                  error: "Erro no upload",
                }
              : f,
          ),
        )
      }
    }
  }

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
