// components/admin/ExpiredJobs.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Job } from "@/types/jobs-interface"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

// Mock service for expired jobs
const expiredJobsService = {
  getExpiredJobs: async (): Promise<Job[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        _id: "job1",
        title: "Desenvolvedor Backend (Expirada)",
        description: "Vaga para desenvolvedor backend com Node.js e MongoDB.",
        status: "vaga fechada",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-02-01"),
        expiresAt: new Date("2023-02-01"),
        createdBy: "admin",
        createdByName: "Admin User",
        candidatesCount: 5,
        competencies: [],
        questions: [],
        isPCDExclusive: false,
        isReferralJob: false,
        slug: "dev-backend-expirada",
        criteriaWeights: { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
      },
      {
        _id: "job2",
        title: "Analista de Dados (Inativa)",
        description: "Vaga para analista de dados com Python e SQL.",
        status: "draft",
        createdAt: new Date("2023-03-01"),
        updatedAt: new Date("2023-03-01"),
        createdBy: "admin",
        createdByName: "Admin User",
        candidatesCount: 0,
        competencies: [],
        questions: [],
        isPCDExclusive: false,
        isReferralJob: false,
        slug: "analista-dados-inativa",
        criteriaWeights: { experience: 0, skills: 0, certifications: 0, behavioral: 0, leadership: 0 },
      },
    ];
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