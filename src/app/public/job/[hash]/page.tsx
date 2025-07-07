"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { IJob } from "@/domain/models/Job";
import { getJobByIdAction } from "@/infrastructure/actions/job-actions";
import { toast } from "@/shared/hooks/use-toast";
import { PublicJobDetails } from "@/shared/components/public-jobs/public-job-details";

export default function PublicJobByHashPage() {
  const params = useParams();
  const jobId = params.hash as string; // Use jobId instead of hash

  const [job, setJob] = useState<IJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchJobDetails = async () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await getJobByIdAction(jobId);
        if (result.success && result.data) {
          setJob(result.data);
        } else {
          toast({
            title: "Erro",
            description: result.error || "Vaga não encontrada.",
            variant: "destructive",
          });
          setJob(null); 
        }
      } catch (err) {
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro inesperado ao carregar a vaga.",
          variant: "destructive",
        });
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

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

  return <PublicJobDetails job={job} />;
}
