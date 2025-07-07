import { useState, useEffect } from 'react';
import { toast } from '@/shared/hooks/use-toast';
import { IJob } from '@/domain/models/Job';

export function usePublicJobs(tenantSlug?: string) {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const jobService = new PublicJobService();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const result = await getPublicJobsAction(tenantSlug);
        if (result.success) {
          setJobs(result.data || []);
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
  }, [tenantSlug]);

  const filteredJobs = jobs.filter(
    job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalJobs: jobs.length,
    totalCandidates: jobs.reduce((acc, job) => acc + job.candidatesCount, 0),
    pcdJobs: jobs.filter(job => job.isPCDExclusive).length,
    models: {
      presencial: 10,
      hibrido: 10,
      remoto: 10
    }
  };

  return {
    jobs: filteredJobs,
    searchTerm,
    setSearchTerm,
    loading,
    stats,
  };
}