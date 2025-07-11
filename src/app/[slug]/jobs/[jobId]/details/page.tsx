"use client"

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobByIdAction } from "@/infrastructure/actions/job-actions";
import { JobDetails } from "@/shared/components/jobs/job-details";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "@/shared/hooks/use-toast";
import { IJob } from "@/domain/models/Job";
import { Button } from "@/shared/components/ui/button";
import { Edit, Users, CheckCircle } from "lucide-react";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.slug as string;
  const jobId = params.jobId as string;

  const [job, setJob] = useState<IJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        try {
          const jobResult = await getJobByIdAction(jobId);
          if (jobResult.success && jobResult.data) {
            setJob(jobResult.data);
          } else {
            toast({
              title: "Erro",
              description: jobResult.error || "Vaga não encontrada.",
              variant: "destructive",
            });
            setJob(null); // Ensure job is null on error
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os detalhes da vaga.",
            variant: "destructive",
          });
          setJob(null);
        } finally {
          setIsLoading(false);
        }
      });
    };

    fetchData();
  }, [jobId]);

  const handleGoToScreening = () => {
    router.push(`/${tenantSlug}/screening?jobId=${jobId}`);
  };

  const handleGoToEvaluation = () => {
    router.push(`/${tenantSlug}/evaluation?jobId=${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-12">Vaga não encontrada.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <Button onClick={handleGoToScreening}>
          <Users className="mr-2 h-4 w-4" /> Ir para Triagem
        </Button>
        <Button onClick={handleGoToEvaluation}>
          <CheckCircle className="mr-2 h-4 w-4" /> Ir para Avaliação
        </Button>
      </div>
      <JobDetails job={job} tenantSlug={tenantSlug} />
    </div>
  );
}