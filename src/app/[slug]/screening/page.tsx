"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowUpDown, Search, Filter, Eye, CheckCircle, XCircle, Download, Badge, Table } from "lucide-react"
import { ShareDialog } from "@/shared/components/share-dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table"
import { toast } from "@/shared/hooks/use-toast"
import { Candidate, Job } from "@/shared/types/types/jobs-interface"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select"
import { Input } from "postcss"
import { Button } from "react-day-picker"


/**
 * @description Página de triagem de candidatos que permite visualizar, filtrar e gerenciar candidatos em processo seletivo
 * 
 * @component ScreeningPage
 * 
 * @dependencies
 * - Requer acesso aos dados mockados: mockCandidates, mockJobsscrening
 * - Utiliza componentes UI do design system: Card, Table, Select, Badge, etc
 * - Integra com o sistema de roteamento através de useParams e useSearchParams
 * 
 * @state
 * - selectedJobId: ID da vaga selecionada para filtrar candidatos
 * - candidates: Lista de candidatos filtrada pela vaga selecionada
 * - searchTerm: Termo de busca para filtrar candidatos por nome/email
 * - sortBy: Campo usado para ordenação dos candidatos
 * - sortOrder: Direção da ordenação (asc/desc)
 * 
 * @features
 * - Filtragem de candidatos por vaga específica
 * - Busca por nome/email de candidatos
 * - Ordenação por diferentes campos (nome, match, data)
 * - Visualização de status de match via IA
 * - Ações de aprovar/reprovar candidatos
 * - Download de currículos
 * - Compartilhamento de relatório de triagem
 * 
 * @customization
 * Para modificar/estender:
 * - Adicione novos campos de ordenação em handleSort()
 * - Expanda os filtros através do botão "Filtros Avançados"
 * - Modifique a lógica de match no getMatchBadge()
 * - Adicione novas ações na coluna de ações da tabela
 * 
 * @communication
 * - Recebe parâmetros de URL para jobId
 * - Integra com sistema de compartilhamento via ShareDialog
 * - Links para perfil detalhado do candidato
 * 
 * @example
 * URL de acesso: /tenant-slug/screening?jobId=123
 */
export default function ScreeningPage() {
  const searchParams = useSearchParams()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(searchParams.get("jobId"))
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Candidate | "finalScore">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)

  const params = useParams()
  const tenantSlug = params.slug as string

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const fetchedCandidates = await candidatesService.getCandidatesForScreening(tenantSlug, selectedJobId)
        setCandidates(fetchedCandidates)
        const fetchedJobs = await JobService.getAllJobs(tenantSlug)
        setJobs(fetchedJobs)
      } catch (error) {
        await auditService.saveLog({
          userId: "", // User ID from session would be better here
          userName: "Sistema",
          actionType: "Carregamento de Dados",
          resourceType: "Triagem",
          resourceId: tenantSlug,
          details: `Falha ao buscar dados para a página de triagem: ${error instanceof Error ? error.message : String(error)}`,
          success: false,
        });
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os candidatos ou vagas para triagem.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [tenantSlug, selectedJobId])

  const selectedJob = jobs.find((job) => job._id === selectedJobId)

  const filteredAndSortedCandidates = candidates
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let valA, valB
      if (sortBy === "finalScore") {
        valA = a.analysis?.finalScore || 0
        valB = b.analysis?.finalScore || 0
      } else {
        valA = a[sortBy as keyof Candidate]
        valB = b[sortBy as keyof Candidate]
      }

      if (valA === undefined || valA === null) valA = "" // Handle undefined for sorting
      if (valB === undefined || valB === null) valB = ""

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA
      }
      if (valA instanceof Date && valB instanceof Date) {
        return sortOrder === "asc" ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime()
      }
      return sortOrder === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA))
    })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Triagem de Candidatos</h1>
          <p className="text-muted-foreground">Analise e mova candidatos para as próximas etapas.</p>
        </div>
        {selectedJob && (
          <ShareDialog
            title={`Compartilhar Triagem - ${selectedJob.title}`}
            resourceType="candidates" // ou um novo tipo "screening_report"
            resourceId={`screening-${selectedJob._id}`}
            resourceName={`Relatório de Triagem - ${selectedJob.title}`}
            tenantSlug={tenantSlug}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros e Seleção de Vaga</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Select value={selectedJobId || ""} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Selecione uma vaga para triagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Vagas em Triagem</SelectItem>
                {jobs
                  .filter((j) => j.status === "triagem" || j.status === "recrutamento" || j.status === "aberta")
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
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
            </Button>
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
                <TableHead>Email</TableHead>
                <TableHead onClick={() => handleSort("finalScore")} className="cursor-pointer">
                  Match IA <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Indicação?</TableHead>
                <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                  Data Aplicação <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCandidates.map((candidate) => (
                <TableRow key={candidate._id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>
                    {getMatchBadge(candidate.matchLevel)} ({candidate.analysis?.finalScore}%)
                  </TableCell>
                  <TableCell>
                    {candidate.isReferral ? (
                      <Badge variant="default" className="bg-teal-500">
                        Sim
                      </Badge>
                    ) : (
                      "Não"
                    )}
                  </TableCell>
                  <TableCell>{new Date(candidate.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" asChild title="Ver Detalhes">
                      <Link href={`/${tenantSlug}/candidate/${candidate._id}?jobId=${selectedJobId}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Aprovar para Avaliação">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Reprovar Candidato">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Download CV">
                      <a href={candidate.curriculumUrl} download={candidate.fileName}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredAndSortedCandidates.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {selectedJobId
                ? `Nenhum candidato em triagem para "${selectedJob?.title}".`
                : "Nenhum candidato em triagem no momento."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
