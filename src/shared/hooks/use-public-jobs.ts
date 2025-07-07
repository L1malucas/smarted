import { useState, useEffect } from 'react';
import { toast } from '@/shared/hooks/use-toast';
import { IJob } from '@/domain/models/Job';
import { listPublicJobsAction } from "@/infrastructure/actions/public-actions";

export function usePublicJobs(tenantSlug?: string, employmentType?: string, experienceLevel?: string, isPCDExclusive?: boolean, page: number = 1, limit: number = 10) {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const result = await listPublicJobsAction({
          tenantId: tenantSlug,
          searchQuery: searchTerm,
          employmentType: employmentType,
          experienceLevel: experienceLevel,
          isPCDExclusive: isPCDExclusive,
          page,
          limit,
        });
        if (result.success) {
          setJobs(result.data?.data || []);
          setTotalJobs(result.data?.total || 0);
        } else {
          toast({
            title: "Erro ao carregar vagas",
            description: result.error || "Não foi possível carregar as vagas públicas.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [tenantSlug, searchTerm, employmentType, experienceLevel, isPCDExclusive, page, limit]);

  const stats = {
    totalJobs: totalJobs,
    totalCandidates: jobs.reduce((acc, job) => acc + job.candidatesCount, 0),
    pcdJobs: jobs.filter(job => job.isPCDExclusive).length,
    models: {
      presencial: jobs.filter(job => job.location?.toLowerCase().includes("presencial")).length,
      hibrido: jobs.filter(job => job.location?.toLowerCase().includes("hibrido")).length,
      remoto: jobs.filter(job => job.location?.toLowerCase().includes("remoto")).length,
    }
  };

  return {
    jobs,
    searchTerm,
    setSearchTerm,
    loading,
    stats,
    totalJobs,
  };
}