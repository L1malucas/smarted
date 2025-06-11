import { useState, useEffect } from 'react';
import { Job } from '@/types/jobs-interface';
import { PublicJobService } from '@/services/public-jobs';

export function usePublicJobs(tenantSlug?: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const jobService = new PublicJobService();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const publicJobs = await jobService.getPublicJobs(tenantSlug);
        setJobs(publicJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
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
  };

  return {
    jobs: filteredJobs,
    searchTerm,
    setSearchTerm,
    loading,
    stats,
  };
}