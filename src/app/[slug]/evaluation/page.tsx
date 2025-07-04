"use client"
// Placeholder for Evaluation Page

// Similar structure to ScreeningPage, but for candidates in 'avaliação' stage
// Key features:
// - Remove candidates from this stage
// - Order by match level (baixo, médio, alto)
// - Detailed view: evaluations, free notes, PCD status, upload tests/responses
// - Define quantity of candidates visible (pagination)

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { ArrowUpDown, Search, CheckCircle, XCircle, Edit2, UploadCloud } from "lucide-react"
import { ShareDialog } from "@/shared/components/share-dialog"
import { Textarea } from "@/shared/components/ui/textarea"
import {
  Dialog,
  DialogContent as ShadDialogContent,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
  DialogFooter as ShadDialogFooter,
} from "@/shared/components/ui/dialog" // Renomeado para evitar conflito
import { Label } from "@/shared/components/ui/label"
import { Candidate, Job } from "@/shared/types/types/jobs-interface"

// Mock data - replace with actual API calls
const mockCandidatesEvaluation: Candidate[] = [
  {
    _id: "candEval1",
    jobId: "1",
    jobSlug: "dev-frontend",
    name: "Charlie Brown",
    email: "charlie@example.com",
    curriculumUrl: "#",
    fileName: "charlie_cv.pdf",
    isReferral: false,
    currentStage: "avaliação",
    createdAt: new Date(),
    updatedAt: new Date(),
    analysis: {
      finalScore: 88,
      experienceScore: 0,
      skillsScore: 0,
      certificationsScore: 0,
      behavioralScore: 0,
      leadershipScore: 0,
      comments: { experience: "", skills: "", certifications: "" },
    },
    matchLevel: "alto",
    annotations: [{ text: "Good technical test", createdAt: new Date(), createdBy: "Admin" }],
    pcdStatus: "not_declared",
  },
  {
    _id: "candEval2",
    jobId: "1",
    jobSlug: "dev-frontend",
    name: "Diana Prince",
    email: "diana@example.com",
    curriculumUrl: "#",
    fileName: "diana_cv.pdf",
    isReferral: false,
    currentStage: "avaliação",
    createdAt: new Date(),
    updatedAt: new Date(),
    analysis: {
      finalScore: 78,
      experienceScore: 0,
      skillsScore: 0,
      certificationsScore: 0,
      behavioralScore: 0,
      leadershipScore: 0,
      comments: { experience: "", skills: "", certifications: "" },
    },
    matchLevel: "médio",
    pcdStatus: "declared",
  },
]

const mockJobsEvaluation: Job[] = [
  {
    _id: "1",
    slug: "dev-frontend",
    title: "Desenvolvedor Frontend Sênior",
    status: "avaliação",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "",
    candidatesCount: 2,
    competencies: [],
    questions: [],
    isPCDExclusive: false,
    isReferralJob: false,
    criteriaWeights: { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
  },
]

/**
 * @page EvaluationPage
 * @description Página de avaliação de candidatos que permite visualizar, filtrar e gerenciar candidatos em processo seletivo.
 * 
 * @component
 * 
 * @state
 * - selectedJobId: ID da vaga selecionada para filtrar candidatos
 * - candidates: Lista de candidatos carregada
 * - searchTerm: Termo de busca para filtrar candidatos
 * - sortBy: Campo usado para ordenação dos candidatos
 * - sortOrder: Ordem de classificação (asc/desc)
 * - matchFilter: Filtro de nível de match dos candidatos
 * - itemsPerPage: Número de itens por página
 * - currentPage: Página atual da paginação
 * - selectedCandidate: Candidato selecionado para visualização detalhada
 * - isDetailModalOpen: Controle de exibição do modal de detalhes
 * - newAnnotation: Nova anotação a ser adicionada ao candidato
 * 
 * @effects
 * - Carrega candidatos quando selectedJobId muda
 * - Filtra candidatos baseado em searchTerm e matchFilter
 * - Ordena candidatos baseado em sortBy e sortOrder
 * - Pagina resultados baseado em currentPage e itemsPerPage
 * 
 * @functions
 * - handleSort: Gerencia a ordenação da tabela
 * - getMatchBadge: Retorna o componente Badge com estilo apropriado para o nível de match
 * - openDetailModal: Abre modal com detalhes do candidato
 * - addAnnotationToCandidate: Adiciona nova anotação ao candidato selecionado
 * 
 * @interface Candidate
 * - _id: string
 * - name: string
 * - email: string
 * - jobId: string
 * - currentStage: string
 * - matchLevel: "baixo" | "médio" | "alto"
 * - analysis: { finalScore: number }
 * - pcdStatus: "declared" | undefined
 * - annotations: Array<{ text: string, createdAt: Date, createdBy: string }>
 * 
 * @relacionamentos
 * - Usa mockCandidatesEvaluation para dados de candidatos
 * - Usa mockJobsEvaluation para dados de vagas
 * - Integra com componente ShareDialog para compartilhamento
 * 
 * @fluxo
 * 1. Usuário seleciona vaga (opcional)
 * 2. Sistema carrega candidatos correspondentes
 * 3. Usuário pode:
 *    - Filtrar por nome/email
 *    - Filtrar por nível de match
 *    - Ordenar por diferentes campos
 *    - Ver detalhes do candidato
 *    - Adicionar anotações
 *    - Aprovar/reprovar candidatos
 * 
 * @modificacoes
 * Para adicionar novas funcionalidades:
 * - Novos filtros: Adicionar estado e lógica em filteredAndSortedCandidates
 * - Novos campos: Atualizar interface Candidate e adicionar coluna na Table
 * - Novas ações: Adicionar botões na coluna de ações e handlers correspondentes
 * - Novos detalhes: Expandir modal de detalhes com novos componentes Card
 */
export default function EvaluationPage() {
  const searchParams = useSearchParams()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(searchParams.get("jobId"))
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Candidate | "finalScore">("analysis.finalScore")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [matchFilter, setMatchFilter] = useState<"all" | "baixo" | "médio" | "alto">("all")
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // State for detailed view modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState("")

  const params = useParams()
  const tenantSlug = params.slug as string

  useEffect(() => {
    if (selectedJobId) {
      const jobCandidates = mockCandidatesEvaluation.filter(
        (c) => c.jobId === selectedJobId && c.currentStage === "avaliação",
      )
      setCandidates(jobCandidates)
    } else {
      setCandidates(mockCandidatesEvaluation.filter((c) => c.currentStage === "avaliação"))
    }
    setCurrentPage(1) // Reset page on filter change
  }, [selectedJobId])

  const selectedJob = mockJobsEvaluation.find((job) => job._id === selectedJobId)

  const filteredAndSortedCandidates = candidates
    .filter(
      (c) =>
        (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (matchFilter === "all" || c.matchLevel === matchFilter),
    )
    .sort((a, b) => {
      let valA, valB
      if (sortBy === "finalScore") {
        valA = a.analysis?.finalScore || 0
        valB = b.analysis?.finalScore || 0
      } else {
        valA = a[sortBy as keyof Candidate] // Add more robust deep key access if needed
        valB = b[sortBy as keyof Candidate]
      }

      if (valA === undefined || valA === null) valA = ""
      if (valB === undefined || valB === null) valB = ""

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA
      }
      if (valA instanceof Date && valB instanceof Date) {
        return sortOrder === "asc" ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime()
      }
      return sortOrder === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA))
    })

  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / itemsPerPage)

  const handleSort = (column: keyof Candidate | "finalScore") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getMatchBadge = (level?: "baixo" | "médio" | "alto") => {
    if (!level) return <Badge variant="outline">N/A</Badge>
    const config = {
      baixo: { className: "bg-red-500 hover:bg-red-600", label: "Baixo" },
      médio: { className: "bg-yellow-500 hover:bg-yellow-600", label: "Médio" },
      alto: { className: "bg-green-500 hover:bg-green-600", label: "Alto" },
    }
    return <Badge className={config[level].className}>{config[level].label}</Badge>
  }

  const openDetailModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsDetailModalOpen(true)
  }

  const addAnnotationToCandidate = () => {
    if (selectedCandidate && newAnnotation.trim() !== "") {
      // Mock update
      const updatedCandidate = {
        ...selectedCandidate,
        annotations: [
          ...(selectedCandidate.annotations || []),
          { text: newAnnotation, createdAt: new Date(), createdBy: "Admin" },
        ],
      }
      setSelectedCandidate(updatedCandidate)
      setCandidates((prev) => prev.map((c) => (c._id === updatedCandidate._id ? updatedCandidate : c)))
      setNewAnnotation("")
      // toast({ title: "Anotação adicionada" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Avaliação de Candidatos</h1>
          <p className="text-muted-foreground">Revise candidatos, adicione notas e mova para contato.</p>
        </div>
        {selectedJob && (
          <ShareDialog
            title={`Compartilhar Avaliação - ${selectedJob.title}`}
            resourceType="candidates" // ou "evaluation_report"
            resourceId={`evaluation-${selectedJob._id}`}
            resourceName={`Relatório de Avaliação - ${selectedJob.title}`}
            tenantSlug={tenantSlug}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros e Seleção de Vaga</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Select value={selectedJobId || "all"} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Selecione uma vaga para avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Vagas em Avaliação</SelectItem>
                {mockJobsEvaluation
                  .filter((j) => j.status === "avaliação")
                  .map((job) => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={matchFilter} onValueChange={(value) => setMatchFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Matches</SelectItem>
                <SelectItem value="alto">Match Alto</SelectItem>
                <SelectItem value="médio">Match Médio</SelectItem>
                <SelectItem value="baixo">Match Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedJob && <p className="mb-4 text-lg font-semibold">Exibindo candidatos para: {selectedJob.title}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Nome <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead onClick={() => handleSort("finalScore")} className="cursor-pointer">
                  Match IA <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>PCD</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCandidates.map((candidate) => (
                <TableRow key={candidate._id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>
                    {getMatchBadge(candidate.matchLevel)} ({candidate.analysis?.finalScore}%)
                  </TableCell>
                  <TableCell>
                    {candidate.pcdStatus === "declared" ? (
                      <Badge variant="info" className="bg-cyan-600">
                        Declarado
                      </Badge>
                    ) : (
                      "Não"
                    )}
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver/Editar Detalhes"
                      onClick={() => openDetailModal(candidate)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Aprovar para Contato">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Remover da Etapa/Reprovar">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedCandidates.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum candidato em avaliação com os filtros atuais.
            </p>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => {
                setItemsPerPage(Number(val))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((val) => (
                  <SelectItem key={val} value={String(val)}>
                    {val}/página
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <ShadDialogContent className="sm:max-w-2xl">
            <ShadDialogHeader>
              <ShadDialogTitle>Detalhes de {selectedCandidate.name}</ShadDialogTitle>
              <CardDescription>Vaga: {selectedJob?.title}</CardDescription>
            </ShadDialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <p>
                <strong>Email:</strong> {selectedCandidate.email}
              </p>
              <p>
                <strong>Match:</strong> {getMatchBadge(selectedCandidate.matchLevel)} (
                {selectedCandidate.analysis?.finalScore}%)
              </p>
              <p>
                <strong>PCD:</strong> {selectedCandidate.pcdStatus === "declared" ? "Declarado" : "Não Declarado"}
              </p>

              <Card>
                <CardHeader>
                  <CardTitle>Avaliações e Testes</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for displaying evaluations */}
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
                  <div className="mt-2">
                    <Label htmlFor="upload-test">Upload de Teste/Resposta</Label>
                    <Input id="upload-test" type="file" className="mt-1" />
                    <Button size="sm" className="mt-2">
                      <UploadCloud className="mr-2 h-4 w-4" /> Enviar Arquivo
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Anotações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {selectedCandidate.annotations?.length ? (
                      selectedCandidate.annotations.map((note, i) => (
                        <div key={i} className="text-sm p-2 border rounded">
                          <p>{note.text}</p>
                          <p className="text-xs text-muted-foreground">
                            Por: {note.createdBy} em {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma anotação.</p>
                    )}
                  </div>
                  <Textarea
                    placeholder="Adicionar nova anotação..."
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                  />
                  <Button size="sm" className="mt-2" onClick={addAnnotationToCandidate}>
                    Adicionar Anotação
                  </Button>
                </CardContent>
              </Card>
            </div>
            <ShadDialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Fechar
              </Button>
            </ShadDialogFooter>
          </ShadDialogContent>
        </Dialog>
      )}
    </div>
  )
}
