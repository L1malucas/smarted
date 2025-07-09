"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowUpDown, Search, Filter, Eye, CheckCircle, XCircle, Download } from "lucide-react"
import { ShareDialog } from "@/shared/components/share-dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/shared/components/ui/table"
import { toast } from "@/shared/hooks/use-toast"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select"
import { Input } from "@/shared/components/ui/input"
import { ICandidate } from "@/domain/models/Candidate"
import { IJob } from "@/domain/models/Job"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { getCandidatesForJobAction } from "@/infrastructure/actions/candidate-actions"
import { listJobsAction } from "@/infrastructure/actions/job-actions"

export default function ScreeningPage() {
  const searchParams = useSearchParams()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(searchParams.get("jobId"))
  const [candidates, setCandidates] = useState<ICandidate[]>([])
  const [jobs, setJobs] = useState<IJob[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof ICandidate | "finalScore">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)

  const params = useParams()
  const tenantSlug = params.slug as string

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const candidatesResult = await getCandidatesForJobAction(selectedJobId || "");
        if (candidatesResult.success && candidatesResult.data) {
          setCandidates(candidatesResult.data as ICandidate[]);
        } else {
          toast({
            title: "Erro ao carregar candidatos",
            description: candidatesResult.error || "Não foi possível carregar os candidatos para triagem.",
            variant: "destructive",
          });
        }

        const jobsResult = await listJobsAction({}); // Fetch all jobs
        if (jobsResult.success && jobsResult.data) {
          setJobs(jobsResult.data.data as IJob[]); // Access .data.data for the array of jobs
        } else {
          toast({
            title: "Erro ao carregar vagas",
            description: jobsResult.error || "Não foi possível carregar as vagas.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro inesperado ao carregar os dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedJobId]);

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
              <SelectTrigger className="w-full sm:max-w-[300px]">
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
          <div className="overflow-x-auto">
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={candidate.resumeUrl} download>
                            <Download className="h-4 w-4 mr-2" /> Download CV
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${tenantSlug}/candidate/${candidate._id}?jobId=${selectedJobId}`}>
                            <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Aprovar para Avaliação
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="h-4 w-4 mr-2 text-red-500" /> Reprovar Candidato
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
