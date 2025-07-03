"use client";

import { JobList } from "@/components/public-jobs/job-list";
import { JobSearch } from "@/components/public-jobs/job-search";
import { JobStats } from "@/components/public-jobs/job-stats";
import { PageHeader } from "@/components/public-jobs/page-header";
import { usePublicJobs } from "@/hooks/use-public-jobs";

export default function PublicJobsPage() {
  const { jobs, searchTerm, setSearchTerm, loading, stats } = usePublicJobs();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Oportunidades de Carreira"
        description="Explore todas as vagas disponíveis e encontre a oportunidade perfeita para você"
      />
      <JobSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <JobStats stats={stats} />
      <JobList jobs={jobs} loading={loading} />
    </div>
  );
}