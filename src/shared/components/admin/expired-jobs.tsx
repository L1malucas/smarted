// components/admin/ExpiredJobs.tsx
import { Job } from "@/shared/types/types/jobs-interface";
import { Table } from "lucide-react";
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";

// Mock service for expired jobs
const expiredJobsService = {
  getExpiredJobs: async (): Promise<Job[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return []; // No expired jobs by default
  },
  reactivateJob: async (jobId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

export default function ExpiredJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const fetchedJobs = await expiredJobsService.getExpiredJobs();
        setJobs(fetchedJobs);
      } catch (error) {
        toast({
          title: "Erro ao carregar vagas",
          description: "Não foi possível carregar as vagas expiradas/inativas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleReactivate = async (jobId: string, jobTitle: string) => {
    try {
      await expiredJobsService.reactivateJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      toast({
        title: "Vaga Reativada",
        description: `A vaga "${jobTitle}" foi reativada com sucesso.`, 
      });
    } catch (error) {
      toast({
        title: "Erro ao Reativar",
        description: "Não foi possível reativar a vaga.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Vagas Expiradas ou Inativas</CardTitle>
        <CardDescription>
          Visualize e gerencie vagas que não estão mais ativas no processo de recrutamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : jobs.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma vaga expirada ou inativa encontrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título da Vaga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{new Date(job.updatedAt).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleReactivate(job._id, job.title)}>
                      Reativar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}