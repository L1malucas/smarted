"use client";

import { JobList } from "@/shared/components/public-jobs/job-list";
import { JobSearch } from "@/shared/components/public-jobs/job-search";
import { JobStats } from "@/shared/components/public-jobs/job-stats";
import { PageHeader } from "@/shared/components/public-jobs/page-header";
import { usePublicJobs } from "@/shared/hooks/use-public-jobs";
import { useParams } from "next/navigation";

export default function PublicJobsPage() {
  const params = useParams();
  const tenantSlug = params.slug as string;
  const { jobs, searchTerm, setSearchTerm, loading, stats } = usePublicJobs(tenantSlug);

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