/**
 * @description Página de gerenciamento de vagas que permite visualizar, filtrar e atualizar o status das vagas
 * 
 * @component JobsPage
 * 
 * @state {Job[]} jobs - Array de vagas carregadas do mockJobs
 * @state {string} searchTerm - Termo de busca para filtrar vagas
 * @state {JobStatus | "all"} statusFilter - Filtro de status atual das vagas
 * @state {("card" | "list")} viewMode - Modo de visualização das vagas (cartão ou lista)
 * 
 * @uses {useParams} - Hook para obter o slug do tenant da URL
 * 
 * @method handleStatusChange
 * @param {string} jobId - ID da vaga a ser atualizada
 * @param {JobStatus} newStatus - Novo status a ser aplicado
 * @description Atualiza o status de uma vaga específica, registra a mudança no histórico e exibe notificação
 * 
 * @method filteredJobs
 * @description Filtra as vagas com base no termo de busca e status selecionado
 * 
 * @renders
 * - Cabeçalho com título e botão de criar nova vaga
 * - Barra de busca e filtros
 * - Alternador de visualização (card/lista)
 * - Lista de vagas em modo card ou lista
 * - Mensagem quando nenhuma vaga é encontrada
 * 
 * @dependencies
 * - Componente JobCard (para visualização em cards)
 * - Interface Job (para tipagem dos dados)
 * - jobStatusOptions (para opções de status)
 * - Diversos componentes UI (Button, Select, Card, etc)
 * 
 * @modificationGuide
 * - Para adicionar novos filtros: Adicione novo estado e lógica no método filteredJobs
 * - Para modificar aparência dos cards: Atualize o componente JobCard
 * - Para adicionar novos status: Atualize o tipo JobStatus e jobStatusOptions
 * - Para integrar com API: Substitua mockJobs e implemente chamadas reais no handleStatusChange
 */

"use client"

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAllJobsAction, updateJobStatusAction } from "@/infrastructure/actions/job-actions";
import { JobFilter } from "@/shared/components/jobs/jobs-list-filters";
import { JobView } from "@/shared/components/jobs/jobs-view";
import { Job, JobStatus } from "@/shared/types/types/jobs-interface";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/hooks/use-toast";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const params = useParams();
  const tenantSlug = params.slug as string;

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getAllJobsAction(tenantSlug);
        if (result.success) {
          setJobs(result.data || []);
        } else {
          toast({
            title: "Erro",
            description: result.error || "Falha ao carregar vagas.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      });
    };
    fetchJobs();
  }, [tenantSlug]);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    startTransition(async () => {
      const result = await updateJobStatusAction(tenantSlug, jobId, newStatus, "current-user-id", "Current User"); // Replace with actual user ID/Name
      if (result.success) {
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job._id === jobId ? result.data || job : job))
        );
        toast({
          title: "Status da Vaga Atualizado",
          description: `Vaga "${result.data?.title || jobId}" movida para ${newStatus}.`,
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao atualizar status da vaga.",
          variant: "destructive",
        });
      }
    });
  };

  const filteredJobs = jobs.filter((job) => {
    if (job.isDraft) return false;
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Vagas</h1>
          <p className="text-muted-foreground">Crie, edite e gerencie o status das suas vagas</p>
        </div>
        <Link href={`/${tenantSlug}/jobs/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </Link>
      </div>

      <JobFilter
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <JobView
          jobs={filteredJobs}
          tenantSlug={tenantSlug}
          viewMode={viewMode}
          onStatusChange={handleStatusChange}
        />
      )}

      {!isLoading && filteredJobs.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <p className="text-muted-foreground">Nenhuma vaga encontrada com os filtros atuais.</p>
          {searchTerm && (
            <Button variant="link" onClick={() => setSearchTerm("")}>
              Limpar busca
            </Button>
          )}
          {statusFilter !== "all" && (
            <Button variant="link" onClick={() => setStatusFilter("all")}>
              Limpar filtro de status
            </Button>
          )}
        </div>
      )}
    </div>
  );
}