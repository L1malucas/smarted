"use client"

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { getJobDetailsAction, getCandidatesForJobAction } from "@/infrastructure/actions/job-actions";
import { JobDetails } from "@/shared/components/jobs/job-details";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "@/shared/hooks/use-toast";
import { Job, Candidate } from "@/shared/types/types/jobs-interface";


export default function JobDetailsPage() {
  const params = useParams();
  const tenantSlug = params.slug as string;
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        try {
          const jobResult = await getJobDetailsAction(jobId);
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

          const candidatesResult = await getCandidatesForJobAction(jobId);
          if (candidatesResult.success && candidatesResult.data) {
            setCandidates(candidatesResult.data);
          } else {
            toast({
              title: "Erro",
              description: candidatesResult.error || "Não foi possível carregar os candidatos.",
              variant: "destructive",
            });
            setCandidates([]); // Ensure candidates is empty on error
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os detalhes da vaga ou candidatos.",
            variant: "destructive",
          });
          setJob(null);
          setCandidates([]);
        } finally {
          setIsLoading(false);
        }
      });
    };

    fetchData();
  }, [jobId]);

  // Calculate radar data based on candidates (if any)
  const defaultRadarData = [
    { subject: "Experiência", A: 0, fullMark: 100 },
    { subject: "Habilidades", A: 0, fullMark: 100 },
    { subject: "Certificações", A: 0, fullMark: 100 },
    { subject: "Comportamental", A: 0, fullMark: 100 },
    { subject: "Liderança", A: 0, fullMark: 100 },
  ];

  const currentRadarData = candidates.length > 0 ? [
    { subject: "Experiência", A: candidates.reduce((sum, c) => sum + (c.analysis?.experienceScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Habilidades", A: candidates.reduce((sum, c) => sum + (c.analysis?.skillsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Certificações", A: candidates.reduce((sum, c) => sum + (c.analysis?.certificationsScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Comportamental", A: candidates.reduce((sum, c) => sum + (c.analysis?.behavioralScore || 0), 0) / candidates.length, fullMark: 100 },
    { subject: "Liderança", A: candidates.reduce((sum, c) => sum + (c.analysis?.leadershipScore || 0), 0) / candidates.length, fullMark: 100 },
  ] : defaultRadarData;

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

  return <JobDetails job={job} candidates={candidates} tenantSlug={tenantSlug} radarData={currentRadarData} />;
}